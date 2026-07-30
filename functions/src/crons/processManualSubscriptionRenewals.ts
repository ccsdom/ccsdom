import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { INVOICE_STATUS, PDF_STATUS } from "../_config/invoice-constants";
import {
  MAIL_PLAN_CATALOG,
  normalizeBillingFrequency,
  normalizeMailPlanId,
  planAmountCents,
  type BillingFrequency,
  type MailPlanId,
} from "../_config/subscription-plans";

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

type AddressKey = "paris" | "orly";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeAddressKey(value: unknown): AddressKey {
  const key = normalizeText(value);
  return key === "paris" || key === "paris_12e" ? "paris" : "orly";
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as any)?.toDate === "function") return (value as any).toDate();
  if (typeof (value as any)?.seconds === "number") {
    return new Date((value as any).seconds * 1000);
  }
  const date = new Date(value as any);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addBillingPeriod(start: Date, frequency: BillingFrequency): Date {
  const end = new Date(start);
  if (frequency === "yearly") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return end;
}

function resolveManualCycle(clientData: Record<string, any>, frequency: BillingFrequency) {
  const now = new Date();
  const start =
    toDate(clientData.subscription?.currentPeriodStart) ||
    toDate(clientData.subscriptionActivatedAt) ||
    toDate(clientData.subscription?.activatedAt) ||
    toDate(clientData.createdAt) ||
    toDate(clientData.joinDate) ||
    now;

  let end =
    toDate(clientData.subscriptionRenewalDate) ||
    toDate(clientData.subscription?.currentPeriodEnd) ||
    addBillingPeriod(start, frequency);

  if (end <= start) {
    end = addBillingPeriod(start, frequency);
  }

  return { start, end, now };
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isManualBillingClient(clientData: Record<string, any>): boolean {
  const stripeSubscriptionId = String(clientData.stripeCheckout?.subscriptionId || "").trim();
  if (stripeSubscriptionId) return false;

  return (
    clientData.billingMode === "manual_admin_activation" ||
    clientData.subscriptionSource === "admin_direct_creation" ||
    Boolean(clientData.initialInvoiceId) ||
    Boolean(clientData.manualActivation)
  );
}

function isCancelledStatus(value: unknown): boolean {
  const status = normalizeText(value);
  return status === "canceled" || status === "cancelled" || status === "inactive" || status === "inactif";
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function renewalInvoiceId(uid: string, periodStart: Date): string {
  return `inv_manual_renewal_${uid}_${dateKey(periodStart)}`;
}

function buildInvoiceSellerSnapshot(addressKey: AddressKey) {
  if (addressKey === "paris") {
    return {
      logoLabel: "BPC",
      name: "BUSINESS PARTNERS CONSULTING",
      legalLine: "SAS - Capital 10 000 EUR",
      address: "9 Rue de Wattignies, 75012 Paris",
      email: "contact.ccs75@gmail.com",
      siret: "952 131 423",
      vat: "",
      approval: "Prefet de Paris 04 - AG/DOM/2023095",
      addressKey,
    };
  }

  return {
    logoLabel: "CCS",
    name: "CONSULTING CONSEIL SERVICES",
    legalLine: "SARL - Capital 100 000 EUR",
    address: "25 Rue Edmond Rostand, 94310 Orly",
    email: "contact.ccs94@gmail.com",
    siret: "830 278 644",
    vat: "",
    approval: "Prefet de Val-de-Marne - AG/DOM/2024-06",
    addressKey,
  };
}

function billingPatch(params: {
  clientData: Record<string, any>;
  planId: MailPlanId;
  frequency: BillingFrequency;
  periodStart: admin.firestore.Timestamp;
  periodEnd: admin.firestore.Timestamp;
  invoiceId: string | null;
  now: admin.firestore.FieldValue;
  clearPendingChange: boolean;
}) {
  const { clientData, planId, frequency, periodStart, periodEnd, invoiceId, now, clearPendingChange } = params;
  const amountCents = planAmountCents(planId, frequency);

  const patch: Record<string, any> = {
    planId,
    plan: planId,
    mailPlanId: planId,
    tier: planId === "business" ? "pro" : planId,
    paymentFrequency: frequency,
    paymentStatus: "paid",
    subscriptionStatus: "active",
    subscriptionPlan: planId,
    subscriptionAmountCents: amountCents,
    subscriptionRenewalDate: periodEnd,
    subscriptionCancelAtPeriodEnd: false,
    subscription: {
      ...(clientData.subscription || {}),
      plan: planId,
      frequency,
      status: "active",
      amountCents,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      updatedAt: now,
    },
    updatedAt: now,
  };

  if (invoiceId) {
    patch.lastInvoiceId = invoiceId;
    patch.invoiceIds = admin.firestore.FieldValue.arrayUnion(invoiceId);
  }

  if (clearPendingChange) {
    patch.pendingSubscriptionChange = admin.firestore.FieldValue.delete();
    patch.subscriptionNextPlanId = admin.firestore.FieldValue.delete();
    patch.subscriptionNextPaymentFrequency = admin.firestore.FieldValue.delete();
  }

  return patch;
}

async function processManualClientRenewal(clientRef: admin.firestore.DocumentReference) {
  return db.runTransaction(async (transaction) => {
    const clientSnap = await transaction.get(clientRef);
    if (!clientSnap.exists) return { processed: false, reason: "missing_client" };

    const clientData = clientSnap.data() || {};
    if (!isManualBillingClient(clientData)) {
      return { processed: false, reason: "not_manual" };
    }

    const subscriptionStatus = normalizeText(clientData.subscriptionStatus);
    const accountStatus = normalizeText(clientData.status);
    if (isCancelledStatus(subscriptionStatus) || isCancelledStatus(accountStatus)) {
      return { processed: false, reason: "already_cancelled" };
    }

    const currentPlanId =
      normalizeMailPlanId(
        clientData.planId ||
          clientData.mailPlanId ||
          clientData.plan ||
          clientData.subscription?.plan
      ) || "starter";
    const currentFrequency = normalizeBillingFrequency(
      clientData.paymentFrequency || clientData.subscription?.frequency
    );
    const cycle = resolveManualCycle(clientData, currentFrequency);

    if (cycle.end > cycle.now) {
      return { processed: false, reason: "not_due" };
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const periodStartDate = cycle.end;

    if (subscriptionStatus === "canceling" || clientData.subscriptionCancelAtPeriodEnd === true) {
      transaction.set(
        clientRef,
        {
          status: "inactive",
          paymentStatus: "canceled",
          subscriptionStatus: "canceled",
          subscriptionCancelAtPeriodEnd: false,
          subscriptionCancelledAt: now,
          subscriptionRenewalDate: null,
          pendingSubscriptionChange: admin.firestore.FieldValue.delete(),
          subscriptionNextPlanId: admin.firestore.FieldValue.delete(),
          subscriptionNextPaymentFrequency: admin.firestore.FieldValue.delete(),
          subscription: {
            ...(clientData.subscription || {}),
            status: "canceled",
            cancelAtPeriodEnd: false,
            cancelledAt: now,
            updatedAt: now,
          },
          updatedAt: now,
        },
        { merge: true }
      );

      return { processed: true, reason: "cancelled_at_period_end" };
    }

    const pendingChange = isPlainObject(clientData.pendingSubscriptionChange)
      ? clientData.pendingSubscriptionChange
      : null;
    const pendingEffectiveAt = toDate(pendingChange?.effectiveAt);
    const shouldApplyPending = Boolean(pendingChange && (!pendingEffectiveAt || pendingEffectiveAt <= cycle.now));
    const nextPlanId =
      (shouldApplyPending && normalizeMailPlanId(pendingChange?.planId)) || currentPlanId;
    const nextFrequency =
      shouldApplyPending
        ? normalizeBillingFrequency(pendingChange?.frequency)
        : currentFrequency;

    const periodStart = admin.firestore.Timestamp.fromDate(periodStartDate);
    const periodEndDate = addBillingPeriod(periodStartDate, nextFrequency);
    const periodEnd = admin.firestore.Timestamp.fromDate(periodEndDate);
    const invoiceId = renewalInvoiceId(clientRef.id, periodStartDate);
    const invoiceRef = db.collection("invoices").doc(invoiceId);
    const invoiceSnap = await transaction.get(invoiceRef);
    let createdInvoice = false;

    if (!invoiceSnap.exists) {
      const currentYear = cycle.now.getFullYear();
      const counterRef = db.doc(`counters/invoices_${currentYear}`);
      const counterSnap = await transaction.get(counterRef);
      const nextNumber = (counterSnap.exists ? Number(counterSnap.data()?.lastNumber || 0) : 0) + 1;
      const invoiceNumber = `FAC-${currentYear}-${String(nextNumber).padStart(4, "0")}`;
      const amountCents = planAmountCents(nextPlanId, nextFrequency);
      const addressKey = normalizeAddressKey(clientData.addressKey || clientData.locationKey);

      transaction.set(invoiceRef, {
        id: invoiceId,
        invoiceNumber,
        status: INVOICE_STATUS.PAID,
        amountCents,
        currency: "EUR",
        addressKey,
        addressId: clientData.addressId || clientData.domiciliationAddressId || null,
        centerId: clientData.centerId || clientData.addressId || clientData.domiciliationAddressId || null,
        requestId: clientRef.id,
        clientId: clientRef.id,
        issuedAt: now,
        paidAt: now,
        dueDate: now,
        type: "subscription",
        source: "manual_subscription_renewal",
        planId: nextPlanId,
        paymentFrequency: nextFrequency,
        description: `Renouvellement abonnement ${MAIL_PLAN_CATALOG[nextPlanId].name}`,
        billingPeriod: {
          start: periodStart,
          end: periodEnd,
          frequency: nextFrequency,
        },
        snapshot: {
          client: {
            name: clientData.companyName || clientData.name || "Client",
            email: clientData.email || clientData.emailLower || "",
            address: clientData.address || "",
            siret: clientData.siret || clientData.siretNorm || "En cours d'immatriculation",
          },
          seller: buildInvoiceSellerSnapshot(addressKey),
        },
        pdf: {
          status: PDF_STATUS.PENDING,
          createdAt: now,
          updatedAt: now,
        },
        createdAt: now,
        updatedAt: now,
      });

      transaction.set(counterRef, { lastNumber: nextNumber, updatedAt: now }, { merge: true });
      createdInvoice = true;
    }

    transaction.set(
      clientRef,
      billingPatch({
        clientData,
        planId: nextPlanId,
        frequency: nextFrequency,
        periodStart,
        periodEnd,
        invoiceId,
        now,
        clearPendingChange: shouldApplyPending,
      }),
      { merge: true }
    );

    return {
      processed: true,
      reason: createdInvoice ? "renewed" : "renewal_already_invoiced",
      invoiceId,
      appliedPendingChange: shouldApplyPending,
    };
  });
}

async function collectManualClientsToProcess(now: admin.firestore.Timestamp) {
  const [dueSnap, missingRenewalSnap] = await Promise.all([
    db
      .collection("clients")
      .where("billingMode", "==", "manual_admin_activation")
      .where("subscriptionRenewalDate", "<=", now)
      .limit(200)
      .get(),
    db
      .collection("clients")
      .where("billingMode", "==", "manual_admin_activation")
      .where("subscriptionRenewalDate", "==", null)
      .limit(50)
      .get(),
  ]);

  const refs = new Map<string, admin.firestore.DocumentReference>();
  for (const docSnap of [...dueSnap.docs, ...missingRenewalSnap.docs]) {
    refs.set(docSnap.ref.path, docSnap.ref);
  }
  return Array.from(refs.values());
}

export const processManualSubscriptionRenewals = onSchedule(
  {
    schedule: "17 * * * *",
    timeZone: "Europe/Paris",
    region: "europe-west1",
    retryCount: 3,
  },
  async () => {
    const now = admin.firestore.Timestamp.now();
    const refs = await collectManualClientsToProcess(now);
    let processed = 0;
    let skipped = 0;
    let failed = 0;

    for (const ref of refs) {
      try {
        const result = await processManualClientRenewal(ref);
        if (result.processed) {
          processed += 1;
          logger.info("[processManualSubscriptionRenewals] Client processed", {
            clientId: ref.id,
            ...result,
          });
        } else {
          skipped += 1;
        }
      } catch (error: any) {
        failed += 1;
        logger.error("[processManualSubscriptionRenewals] Client failed", {
          clientId: ref.id,
          message: error?.message ?? String(error),
        });
      }
    }

    logger.info("[processManualSubscriptionRenewals] Completed", {
      candidates: refs.length,
      processed,
      skipped,
      failed,
    });
  }
);
