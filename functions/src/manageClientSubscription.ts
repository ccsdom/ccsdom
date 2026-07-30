import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import Stripe from "stripe";
import { INVOICE_STATUS, PDF_STATUS } from "./_config/invoice-constants";
import {
  MAIL_PLAN_CATALOG,
  normalizeBillingFrequency,
  normalizeMailPlanId,
  planAmountCents,
  stripePriceIdForPlan,
  type BillingFrequency,
  type MailPlanId,
} from "./_config/subscription-plans";

if (!admin.apps.length) admin.initializeApp();

const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");

let stripe: Stripe | null = null;

function getStripe(): Stripe {
  const secret = STRIPE_SECRET_KEY.value();
  if (!secret) {
    throw new HttpsError("failed-precondition", "Stripe n'est pas configure cote serveur.");
  }
  if (!stripe) {
    stripe = new Stripe(secret, { typescript: true });
  }
  return stripe;
}

function normalizeEmailLower(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeAddressKey(value: unknown): "paris" | "orly" {
  const key = String(value ?? "").trim().toLowerCase();
  if (key === "paris" || key === "paris_12e") return "paris";
  return "orly";
}

function isAllowedReturnUrl(rawUrl: unknown): boolean {
  const value = String(rawUrl ?? "").trim();
  if (!value) return true;

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    return (
      url.protocol === "https:" &&
      (host === "ccsdom.fr" ||
        host === "www.ccsdom.fr" ||
        host.endsWith(".hosted.app") ||
        host.endsWith(".cloudworkstations.dev"))
    ) || (
      url.protocol === "http:" &&
      (host === "localhost" || host === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

function withSearchParam(rawUrl: string, params: Record<string, string>): string {
  const url = new URL(rawUrl);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

function currentPeriodEnd(subscription: any): admin.firestore.Timestamp | null {
  const value = Number(subscription?.current_period_end || 0);
  return value > 0 ? admin.firestore.Timestamp.fromMillis(value * 1000) : null;
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

function resolveManualBillingCycle(clientData: Record<string, any>, frequency: BillingFrequency) {
  const now = new Date();
  const rawStart =
    toDate(clientData.subscription?.currentPeriodStart) ||
    toDate(clientData.subscriptionActivatedAt) ||
    toDate(clientData.subscription?.activatedAt) ||
    toDate(clientData.createdAt) ||
    toDate(clientData.joinDate) ||
    now;
  let start = rawStart;
  let end =
    toDate(clientData.subscriptionRenewalDate) ||
    toDate(clientData.subscription?.currentPeriodEnd) ||
    addBillingPeriod(start, frequency);

  while (end <= now) {
    start = end;
    end = addBillingPeriod(start, frequency);
  }

  return { start, end, now };
}

function remainingPeriodRatio(start: Date, end: Date, now: Date): number {
  const totalMs = Math.max(1, end.getTime() - start.getTime());
  const remainingMs = Math.max(0, end.getTime() - now.getTime());
  return Math.min(1, remainingMs / totalMs);
}

function subscriptionPatch(params: {
  planId: MailPlanId;
  frequency: BillingFrequency;
  status: string;
  priceId: string;
  customerId?: string | null;
  subscriptionId?: string | null;
  currentPeriodStart?: admin.firestore.Timestamp | null;
  currentPeriodEnd?: admin.firestore.Timestamp | null;
  cancelAtPeriodEnd?: boolean;
}) {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const {
    planId,
    frequency,
    status,
    priceId,
    customerId,
    subscriptionId,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd,
  } = params;

  return {
    planId,
    plan: planId,
    mailPlanId: planId,
    tier: planId === "business" ? "pro" : planId,
    paymentFrequency: frequency,
    paymentStatus: status === "past_due" || status === "unpaid" ? "failed" : "paid",
    subscriptionStatus: cancelAtPeriodEnd ? "canceling" : status || "active",
    subscriptionPlan: planId,
    subscriptionRenewalDate: currentPeriodEnd || null,
    subscriptionCancelAtPeriodEnd: cancelAtPeriodEnd === true,
    subscriptionAmountCents: planAmountCents(planId, frequency),
    subscription: {
      plan: planId,
      frequency,
      status: cancelAtPeriodEnd ? "canceling" : status || "active",
      amountCents: planAmountCents(planId, frequency),
      currentPeriodStart: currentPeriodStart || null,
      currentPeriodEnd: currentPeriodEnd || null,
      cancelAtPeriodEnd: cancelAtPeriodEnd === true,
      updatedAt: now,
    },
    stripeCheckout: {
      customerId: customerId || null,
      subscriptionId: subscriptionId || null,
      priceId,
      planId,
      paymentFrequency: frequency,
      mode: "subscription",
      status: status || null,
      updatedAt: now,
    },
    updatedAt: now,
  };
}

function isManualSubscription(clientData: Record<string, any>): boolean {
  const subscriptionId = String(clientData.stripeCheckout?.subscriptionId || "").trim();
  if (subscriptionId) return false;

  return (
    clientData.billingMode === "manual_admin_activation" ||
    clientData.subscriptionSource === "admin_direct_creation" ||
    Boolean(clientData.initialInvoiceId) ||
    Boolean(clientData.manualActivation)
  );
}

async function createSubscriptionCheckoutSession(params: {
  stripeClient: Stripe;
  uid: string;
  clientRef: admin.firestore.DocumentReference;
  clientData: Record<string, any>;
  planId: MailPlanId;
  frequency: BillingFrequency;
  addressKey: "paris" | "orly";
  priceId: string;
  returnUrl: string;
  flow: string;
}) {
  const {
    stripeClient,
    uid,
    clientRef,
    clientData,
    planId,
    frequency,
    addressKey,
    priceId,
    returnUrl,
    flow,
  } = params;
  const customerId = String(clientData.stripeCheckout?.customerId || "").trim();
  const email = normalizeEmailLower(clientData.email || clientData.emailLower);
  const now = admin.firestore.FieldValue.serverTimestamp();
  const metadata = {
    firebaseUID: uid,
    requestUid: uid,
    addressKey,
    planId,
    mailPlanId: planId,
    paymentFrequency: frequency,
    subscriptionFlow: flow,
  };

  const session = await stripeClient.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: withSearchParam(returnUrl, {
      subscription: "success",
      session_id: "{CHECKOUT_SESSION_ID}",
    }),
    cancel_url: withSearchParam(returnUrl, { subscription: "cancelled" }),
    customer: customerId || undefined,
    customer_email: customerId ? undefined : email || undefined,
    client_reference_id: uid,
    metadata,
    subscription_data: { metadata },
    billing_address_collection: "required",
    allow_promotion_codes: true,
  });

  await clientRef.set(
    {
      pendingSubscriptionChange: {
        planId,
        frequency,
        priceId,
        checkoutSessionId: session.id,
        source: flow,
        createdAt: now,
      },
      recurringPaymentSetup: {
        status: "pending_checkout",
        planId,
        frequency,
        checkoutSessionId: session.id,
        updatedAt: now,
      },
      requiresRecurringPaymentSetup: true,
      subscriptionStatus: clientData.subscriptionStatus || "pending_payment_setup",
      updatedAt: now,
    },
    { merge: true }
  );

  return {
    ok: true,
    mode: "checkout",
    url: session.url,
    sessionId: session.id,
    planId,
    frequency,
  };
}

function buildInvoiceSellerSnapshot(addressKey: "paris" | "orly") {
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

async function applyManualSubscriptionChange(params: {
  db: admin.firestore.Firestore;
  uid: string;
  clientRef: admin.firestore.DocumentReference;
  clientData: Record<string, any>;
  planId: MailPlanId;
  frequency: BillingFrequency;
  addressKey: "paris" | "orly";
  priceId: string;
}) {
  const { db, uid, clientRef, clientData, planId, frequency, addressKey, priceId } = params;
  const invoiceRef = db.collection("invoices").doc();
  const currentPlanId =
    normalizeMailPlanId(
      clientData.planId ||
        clientData.mailPlanId ||
        clientData.plan ||
        clientData.subscription?.plan
    ) || planId;
  const currentFrequency = normalizeBillingFrequency(
    clientData.paymentFrequency || clientData.subscription?.frequency
  );
  const cycle = resolveManualBillingCycle(clientData, currentFrequency);
  const currentPeriodStart = admin.firestore.Timestamp.fromDate(cycle.start);
  const currentPeriodEnd = admin.firestore.Timestamp.fromDate(cycle.end);
  const ratio = remainingPeriodRatio(cycle.start, cycle.end, cycle.now);
  const currentAmountCents = planAmountCents(currentPlanId, currentFrequency);
  const nextAmountCents = planAmountCents(planId, frequency);
  const proratedDifferenceCents = Math.max(
    0,
    Math.round((nextAmountCents - currentAmountCents) * ratio)
  );

  if (currentPlanId === planId && currentFrequency === frequency) {
    return {
      invoiceId: null,
      mode: "manual_noop",
      effectiveAt: null,
      amountCents: 0,
    };
  }

  if (proratedDifferenceCents <= 0) {
    await clientRef.set(
      {
        pendingSubscriptionChange: {
          planId,
          frequency,
          priceId,
          effectiveAt: currentPeriodEnd,
          reason: "downgrade_or_lower_cost_scheduled",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        subscriptionStatus: "active",
        subscriptionNextPlanId: planId,
        subscriptionNextPaymentFrequency: frequency,
        subscriptionRenewalDate: currentPeriodEnd,
        subscription: {
          ...(clientData.subscription || {}),
          nextPlan: planId,
          nextFrequency: frequency,
          currentPeriodStart,
          currentPeriodEnd,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return {
      invoiceId: null,
      mode: "manual_scheduled_change",
      effectiveAt: cycle.end.toISOString(),
      amountCents: 0,
    };
  }

  await db.runTransaction(async (transaction) => {
    const now = admin.firestore.FieldValue.serverTimestamp();
    const currentYear = new Date().getFullYear();
    const counterRef = db.doc(`counters/invoices_${currentYear}`);
    const counterSnap = await transaction.get(counterRef);
    const nextNumber = (counterSnap.exists ? Number(counterSnap.data()?.lastNumber || 0) : 0) + 1;
    const invoiceNumber = `FAC-${currentYear}-${String(nextNumber).padStart(4, "0")}`;
    const amountCents = proratedDifferenceCents;

    transaction.set(
      clientRef,
      {
        ...subscriptionPatch({
          planId,
          frequency,
          status: "active",
          priceId,
          customerId: clientData.stripeCheckout?.customerId || null,
          subscriptionId: null,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: false,
        }),
        status: "active",
        paymentStatus: "paid",
        billingMode: clientData.billingMode || "manual_admin_activation",
        subscriptionSource: clientData.subscriptionSource || "admin_direct_creation",
        pendingSubscriptionChange: admin.firestore.FieldValue.delete(),
        subscriptionNextPlanId: admin.firestore.FieldValue.delete(),
        subscriptionNextPaymentFrequency: admin.firestore.FieldValue.delete(),
        lastInvoiceId: invoiceRef.id,
        invoiceIds: admin.firestore.FieldValue.arrayUnion(invoiceRef.id),
        updatedAt: now,
      },
      { merge: true }
    );

    transaction.set(invoiceRef, {
      id: invoiceRef.id,
      invoiceNumber,
      status: INVOICE_STATUS.PAID,
      amountCents,
      currency: "EUR",
      addressKey,
      addressId: clientData.addressId || clientData.domiciliationAddressId || null,
      centerId: clientData.centerId || clientData.addressId || clientData.domiciliationAddressId || null,
      requestId: uid,
      clientId: uid,
      issuedAt: now,
      paidAt: now,
      dueDate: now,
      type: "subscription",
      source: "manual_subscription_proration",
      planId,
      paymentFrequency: frequency,
      description: `Ajustement prorata ${MAIL_PLAN_CATALOG[currentPlanId].name} vers ${MAIL_PLAN_CATALOG[planId].name}`,
      billingAdjustment: {
        type: "proration",
        previousPlanId: currentPlanId,
        previousFrequency: currentFrequency,
        newPlanId: planId,
        newFrequency: frequency,
        currentAmountCents,
        nextAmountCents,
        remainingRatio: ratio,
        currentPeriodStart,
        currentPeriodEnd,
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
  });

  return {
    invoiceId: invoiceRef.id,
    mode: "manual_updated",
    effectiveAt: cycle.now.toISOString(),
    amountCents: proratedDifferenceCents,
  };
}

export const updateClientSubscription = onCall(
  { region: "europe-west9", cors: true, secrets: [STRIPE_SECRET_KEY] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentification requise.");
    }

    const uid = request.auth.uid;
    const planId = normalizeMailPlanId(request.data?.planId);
    const frequency = normalizeBillingFrequency(request.data?.frequency);
    const returnUrl = String(request.data?.returnUrl || "https://ccsdom.fr/dashboard/subscription").trim();

    if (!planId) {
      throw new HttpsError("invalid-argument", "Offre invalide.");
    }
    if (!isAllowedReturnUrl(returnUrl)) {
      throw new HttpsError("invalid-argument", "URL de retour non autorisee.");
    }

    const db = admin.firestore();
    const clientRef = db.collection("clients").doc(uid);
    const clientSnap = await clientRef.get();

    if (!clientSnap.exists) {
      throw new HttpsError("not-found", "Profil client introuvable.");
    }

    const clientData = clientSnap.data() || {};
    const priceId = stripePriceIdForPlan(planId, frequency);
    const addressKey = normalizeAddressKey(clientData.addressKey || clientData.locationKey);
    const customerId = String(clientData.stripeCheckout?.customerId || "").trim();
    const subscriptionId = String(clientData.stripeCheckout?.subscriptionId || "").trim();
    const email = normalizeEmailLower(clientData.email || clientData.emailLower);

    const metadata = {
      firebaseUID: uid,
      requestUid: uid,
      addressKey,
      planId,
      mailPlanId: planId,
      paymentFrequency: frequency,
      subscriptionFlow: "client_subscription_management",
    };

    if (subscriptionId) {
      const stripeClient = getStripe();
      const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
      const itemId = subscription.items.data[0]?.id;

      if (!itemId) {
        throw new HttpsError("failed-precondition", "Abonnement Stripe incomplet.");
      }

      const updatedSubscription = await stripeClient.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
        items: [{ id: itemId, price: priceId }],
        metadata,
        proration_behavior: "create_prorations",
      });

      await clientRef.set(
        subscriptionPatch({
          planId,
          frequency,
          status: updatedSubscription.status || "active",
          priceId,
          customerId: typeof updatedSubscription.customer === "string" ? updatedSubscription.customer : customerId,
          subscriptionId: updatedSubscription.id,
          currentPeriodEnd: currentPeriodEnd(updatedSubscription),
          cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end === true,
        }),
        { merge: true }
      );

      logger.info("[updateClientSubscription] Subscription updated", {
        uid,
        planId,
        frequency,
        subscriptionId,
      });

      return {
        ok: true,
        mode: "updated",
        planId,
        frequency,
        subscriptionStatus: updatedSubscription.status,
      };
    }

    if (isManualSubscription(clientData)) {
      const stripeClient = getStripe();
      const result = await createSubscriptionCheckoutSession({
        stripeClient,
        uid,
        clientRef,
        clientData,
        planId,
        frequency,
        addressKey,
        priceId,
        returnUrl,
        flow: "manual_client_recurring_payment_setup",
      });

      logger.info("[updateClientSubscription] Manual client redirected to Stripe Checkout", {
        uid,
        planId,
        frequency,
        sessionId: result.sessionId,
      });

      return result;
    }

    const stripeClient = getStripe();
    const sessionResult = await createSubscriptionCheckoutSession({
      stripeClient,
      uid,
      clientRef,
      clientData,
      planId,
      frequency,
      addressKey,
      priceId,
      returnUrl,
      flow: metadata.subscriptionFlow,
    });

    logger.info("[updateClientSubscription] Checkout session created", {
      uid,
      planId,
      frequency,
      sessionId: sessionResult.sessionId,
    });

    return sessionResult;
  }
);

export const cancelClientSubscription = onCall(
  { region: "europe-west9", cors: true, secrets: [STRIPE_SECRET_KEY] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentification requise.");
    }

    const uid = request.auth.uid;
    const db = admin.firestore();
    const clientRef = db.collection("clients").doc(uid);
    const clientSnap = await clientRef.get();

    if (!clientSnap.exists) {
      throw new HttpsError("not-found", "Profil client introuvable.");
    }

    const clientData = clientSnap.data() || {};
    const subscriptionId = String(clientData.stripeCheckout?.subscriptionId || "").trim();
    const now = admin.firestore.FieldValue.serverTimestamp();

    if (!subscriptionId) {
      const frequency = normalizeBillingFrequency(
        clientData.paymentFrequency || clientData.subscription?.frequency
      );
      const cycle = resolveManualBillingCycle(clientData, frequency);
      const currentPeriodStart = admin.firestore.Timestamp.fromDate(cycle.start);
      const currentPeriodEnd = admin.firestore.Timestamp.fromDate(cycle.end);

      await clientRef.set(
        {
          subscriptionStatus: "canceling",
          subscriptionCancelAtPeriodEnd: true,
          subscriptionCancellationRequestedAt: now,
          subscriptionRenewalDate: currentPeriodEnd,
          pendingSubscriptionChange: admin.firestore.FieldValue.delete(),
          subscriptionNextPlanId: admin.firestore.FieldValue.delete(),
          subscriptionNextPaymentFrequency: admin.firestore.FieldValue.delete(),
          subscription: {
            ...(clientData.subscription || {}),
            status: "canceling",
            frequency,
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd: true,
            cancellationRequestedAt: now,
          },
          updatedAt: now,
        },
        { merge: true }
      );

      return {
        ok: true,
        mode: "manual_cancel_at_period_end",
        subscriptionStatus: "canceling",
        currentPeriodEnd: cycle.end.toISOString(),
      };
    }

    const stripeClient = getStripe();
    const subscription = await stripeClient.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
      metadata: {
        firebaseUID: uid,
        cancellationRequestedBy: uid,
        cancellationRequestedAt: new Date().toISOString(),
      },
    });

    await clientRef.set(
      {
        subscriptionStatus: "canceling",
        subscriptionCancelAtPeriodEnd: true,
        subscriptionCancellationRequestedAt: now,
        subscriptionRenewalDate: currentPeriodEnd(subscription),
        subscription: {
          ...(clientData.subscription || {}),
          status: "canceling",
          cancelAtPeriodEnd: true,
          currentPeriodEnd: currentPeriodEnd(subscription),
          cancellationRequestedAt: now,
        },
        stripeCheckout: {
          ...(clientData.stripeCheckout || {}),
          subscriptionId,
          status: subscription.status || null,
          updatedAt: now,
        },
        updatedAt: now,
      },
      { merge: true }
    );

    logger.info("[cancelClientSubscription] Cancellation scheduled", {
      uid,
      subscriptionId,
    });

    return {
      ok: true,
      mode: "stripe_cancel_at_period_end",
      subscriptionStatus: "canceling",
      currentPeriodEnd: currentPeriodEnd(subscription)?.toDate().toISOString() || null,
    };
  }
);
