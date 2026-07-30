/* ==========================================================================
 * callable/roles/setRole.ts - setRole (canonical + multi-center claims)
 * ========================================================================== */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { CLIENT_STATUS } from "../../_config/signup-constants";
import { INVOICE_STATUS, PDF_STATUS } from "../../_config/invoice-constants";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { randomBytes } from "crypto";
import { buildAdminClientRequestMirror } from "../../_utils/admin-client-request-mirror";
import { performCreatePdfJobs } from "../../pdfJobs";
import {
  normalizeBillingFrequency,
  planAmountCents,
  type BillingFrequency,
} from "../../_config/subscription-plans";

type AddressId = string;
type PlanId = "classic" | "starter" | "business" | "premium";
type ClientStatus = typeof CLIENT_STATUS[keyof typeof CLIENT_STATUS];
type StaffRole =
  | "manager"
  | "manager_paris"
  | "manager_orly"
  | "secretary_paris"
  | "secretary_orly"
  | "super_admin";
type UserRole = "client" | StaffRole;

const ALLOWED_CALLER_ROLES = new Set<StaffRole>([
  "super_admin",
  "manager",
  "manager_paris",
  "manager_orly",
  "secretary_paris",
  "secretary_orly",
]);

const ALLOWED_NEW_ROLES = new Set<UserRole>([
  "client",
  "manager",
  "manager_paris",
  "manager_orly",
  "secretary_paris",
  "secretary_orly",
  "super_admin",
]);

const LOGIN_URL = "https://ccsdom.fr/login";

const CENTER_BY_ROLE: Partial<Record<UserRole, AddressId>> = {
  manager_paris: "paris_12e",
  secretary_paris: "paris_12e",
  manager_orly: "orly_ville",
  secretary_orly: "orly_ville",
};

const PLAN_LABELS: Record<PlanId, string> = {
  classic: "Classic",
  starter: "Starter",
  business: "Business",
  premium: "Premium",
};

function normalizeEmailLower(email?: string): string {
  return (email || "").trim().toLowerCase();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function randomClientActivationPassword(): string {
  return `${randomBytes(18).toString("base64url")}Aa1!`;
}

function normalizeSiret(s?: string): string {
  return (s || "").replace(/\D/g, "").trim();
}

function normalizeRole(value: unknown): UserRole | null {
  const role = String(value || "").trim().toLowerCase();
  if (!role) return null;
  return ALLOWED_NEW_ROLES.has(role as UserRole) ? (role as UserRole) : null;
}

function normalizeCenterId(value: unknown): AddressId | null {
  const centerId = String(value ?? "").trim().toLowerCase();
  if (!centerId || !/^[a-z0-9_-]{2,80}$/.test(centerId)) return null;
  if (centerId === "paris") return "paris_12e";
  if (centerId === "orly") return "orly_ville";
  return centerId;
}

function normalizeManagedCenterIds(value: unknown): AddressId[] {
  const raw = Array.isArray(value) ? value : value ? [value] : [];
  const centerIds = raw
    .map((item) => normalizeCenterId(item))
    .filter((item): item is AddressId => Boolean(item));

  return Array.from(new Set(centerIds)).slice(0, 25);
}

function mergeCenterIds(...groups: Array<Array<AddressId | null | undefined>>): AddressId[] {
  return Array.from(
    new Set(groups.flat().filter((item): item is AddressId => Boolean(item)))
  );
}

function resolveRequestedManagedCenterIds(payload: any): AddressId[] {
  return mergeCenterIds(
    normalizeManagedCenterIds(payload?.managedCenterIds),
    normalizeManagedCenterIds(payload?.centerIds),
    normalizeManagedCenterIds(payload?.managedAddressId),
    normalizeManagedCenterIds(payload?.centerId),
    normalizeManagedCenterIds(payload?.addressId)
  );
}

function legacyKeyForCenter(centerId: string): string | null {
  if (centerId === "paris_12e") return "paris";
  if (centerId === "orly_ville") return "orly";
  return null;
}

function addressKeyForCenter(centerId: string): string {
  return legacyKeyForCenter(centerId) || centerId;
}

function invoiceIdForDirectClientCreation(uid: string): string {
  return `inv_admin_onboarding_${uid}`;
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

function billingFrequencyLabel(frequency: BillingFrequency): string {
  return frequency === "yearly" ? "annuel" : "mensuel";
}

async function buildPasswordSetupLink(email: string): Promise<string> {
  return admin.auth().generatePasswordResetLink(email, {
    url: LOGIN_URL,
    handleCodeInApp: false,
  });
}

async function queueActivationEmail(to: string, html: string) {
  await admin.firestore().collection("mails").add({
    to: [to],
    message: {
      subject: "Activez votre espace client CCS DOM",
      html,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

function buildClientActivationHtml(args: {
  companyName: string;
  displayName: string;
  link: string;
}) {
  const greeting = args.displayName ? `Bonjour ${args.displayName},` : "Bonjour,";
  const companyLine = args.companyName
    ? `Votre espace client CCS DOM pour <strong>${args.companyName}</strong> est maintenant prêt.`
    : "Votre espace client CCS DOM est maintenant prêt.";

  return `
    <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111827">
      <h2 style="margin:0 0 12px">Activation de votre espace client CCS DOM</h2>
      <p>${greeting}</p>
      <p>${companyLine}</p>
      <p>Pour finaliser votre accÃ¨s, cliquez sur le bouton ci-dessous et dÃ©finissez votre mot de passe sÃ©curisÃ©.</p>
      <p>Une fois connecté, ouvrez la rubrique <strong>Abonnement</strong> afin d'activer le prélèvement récurrent Stripe de vos prochaines factures.</p>
      <p style="margin-top:18px">
        <a href="${args.link}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">
          Activer mon espace client
        </a>
      </p>
      <p style="margin-top:18px;font-size:13px;color:#4b5563">
        Si vous n'Ãªtes pas Ã  l'origine de cette demande, vous pouvez ignorer cet e-mail.
      </p>
      <p style="margin-top:22px">â€” <strong>CCS DOM</strong></p>
    </div>
  `;
}

function buildInvoiceSellerSnapshot(addressKey: string): Record<string, any> {
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

function centerMatches(managedCenterId: string, targetCenterId: string | null): boolean {
  if (!targetCenterId) return false;
  return managedCenterId === targetCenterId || legacyKeyForCenter(managedCenterId) === targetCenterId;
}

function centerListContains(centerIds: string[], targetCenterId: string | null): boolean {
  return centerIds.some((centerId) => centerMatches(centerId, targetCenterId));
}

function resolveAddressIdFromClientData(cd: any): AddressId | null {
  const v = cd?.centerId || cd?.domiciliationAddressId || cd?.addressId || cd?.locationKey || cd?.addressKey;
  const normalized = normalizeCenterId(v);
  if (normalized) return normalized;

  const k = (cd?.addressKey || "").toString().toLowerCase();
  if (k === "paris") return "paris_12e";
  if (k === "orly") return "orly_ville";

  return null;
}

function resolvePlanIdFromClientData(cd: any): PlanId {
  if (cd?.planId && ["classic", "starter", "business", "premium"].includes(cd.planId)) {
    return cd.planId as PlanId;
  }
  if (cd?.plan && ["classic", "starter", "business", "premium"].includes(cd.plan)) {
    return cd.plan as PlanId;
  }

  const legacy = (cd?.plan || cd?.mailPlanId || cd?.tier || "").toString().toLowerCase();
  if (legacy === "standard") return "business";
  if (legacy === "classic") return "classic";
  if (legacy === "starter") return "starter";
  if (legacy === "business" || legacy === "pro") return "business";
  if (legacy === "premium") return "premium";
  return "starter";
}

function resolveCompanyName(cd: any): string {
  const v = (cd?.companyName || cd?.name || "").toString().trim();
  return v || "-";
}

function resolveRepresentative(cd: any): string {
  return (cd?.representative || cd?.legalRepresentative || cd?.director || "").toString().trim();
}

function resolveRepresentativeAddress(cd: any): string {
  return (
    cd?.representativeAddress ||
    cd?.personalAddress ||
    cd?.homeAddress ||
    cd?.address ||
    ""
  ).toString().trim();
}

function resolveLegalStatusFromClientData(cd: any): string {
  return (cd?.legalStatus || cd?.formeJuridique || cd?.legalForm || "").toString().trim();
}

function resolveRepresentativeQuality(cd: any): string {
  return (cd?.quality || cd?.representativeQuality || cd?.signatoryQuality || "").toString().trim();
}

function resolveShareCapital(cd: any): string {
  return (cd?.shareCapital || cd?.capitalSocial || cd?.capital || "").toString().trim();
}

function roleCenter(role: UserRole | null): AddressId | null {
  if (!role) return null;
  return CENTER_BY_ROLE[role] || null;
}

function isSecretaryRole(role: UserRole | null): role is "secretary_paris" | "secretary_orly" {
  return role === "secretary_paris" || role === "secretary_orly";
}

function managedCentersForRole(role: UserRole, requestedCenterIds: AddressId[]): AddressId[] {
  const legacyCenter = roleCenter(role);
  if (legacyCenter) return [legacyCenter];
  if (role === "manager") return requestedCenterIds;
  return [];
}

function managedCentersFromUserData(role: UserRole | null, data: any): AddressId[] {
  return mergeCenterIds(
    normalizeManagedCenterIds(data?.managedCenterIds),
    normalizeManagedCenterIds(data?.managedAddressId),
    [roleCenter(role)]
  );
}

async function assertManagedCentersExist(db: admin.firestore.Firestore, centerIds: AddressId[]) {
  if (centerIds.length === 0) return;

  const snaps = await Promise.all(centerIds.map((centerId) => db.collection("centers").doc(centerId).get()));
  const missing = centerIds.filter((_, index) => !snaps[index].exists);

  if (missing.length > 0) {
    throw new HttpsError("invalid-argument", `Centre inconnu: ${missing.join(", ")}`);
  }
}

async function resolveCaller(request: any): Promise<{ uid: string; role: StaffRole; managedCenterIds: AddressId[] }> {
  const uid = String(request.auth?.uid || "").trim();
  if (!uid) throw new HttpsError("unauthenticated", "Auth requise");

  const claimRole = normalizeRole((request.auth?.token as any)?.role);
  if (claimRole && ALLOWED_CALLER_ROLES.has(claimRole as StaffRole)) {
    const managedCenterIds = managedCentersFromUserData(claimRole, request.auth?.token as any);
    return { uid, role: claimRole as StaffRole, managedCenterIds };
  }

  const snap = await admin.firestore().collection("users").doc(uid).get();
  const firestoreRole = normalizeRole(snap.data()?.role);

  if (!firestoreRole || !ALLOWED_CALLER_ROLES.has(firestoreRole as StaffRole)) {
    throw new HttpsError("permission-denied", "Droits insuffisants");
  }

  return {
    uid,
    role: firestoreRole as StaffRole,
    managedCenterIds: managedCentersFromUserData(firestoreRole, snap.data()),
  };
}

function assertClientCenterAllowed(caller: { role: StaffRole; managedCenterIds: AddressId[] }, clientData: any) {
  if (caller.role === "super_admin") return;

  const clientCenter = resolveAddressIdFromClientData(clientData);

  if (!clientCenter || !centerListContains(caller.managedCenterIds, clientCenter)) {
    throw new HttpsError("permission-denied", "Centre non autorise pour ce role");
  }
}

function assertRoleChangeAllowed(params: {
  callerUid: string;
  callerRole: StaffRole;
  callerManagedCenterIds: AddressId[];
  targetUid: string;
  targetCurrentRole: UserRole | null;
  targetRole: UserRole;
  clientData: any;
}) {
  const {
    callerUid,
    callerRole,
    callerManagedCenterIds,
    targetUid,
    targetCurrentRole,
    targetRole,
    clientData,
  } = params;

  if (callerRole === "super_admin") {
    if (callerUid === targetUid && targetCurrentRole === "super_admin" && targetRole !== "super_admin") {
      throw new HttpsError("failed-precondition", "Impossible de retirer son propre role super_admin");
    }
    return;
  }

  if (targetCurrentRole === "super_admin" || targetRole === "super_admin") {
    throw new HttpsError("permission-denied", "Seul un super_admin peut gerer ce role");
  }

  if (targetRole === "manager" || targetRole === "manager_paris" || targetRole === "manager_orly") {
    throw new HttpsError("permission-denied", "Seul un super_admin peut gerer les gestionnaires");
  }

  if (targetCurrentRole && targetCurrentRole !== "client") {
    const sameParisSecretary =
      callerRole === "manager_paris" &&
      targetCurrentRole === "secretary_paris" &&
      targetRole === "secretary_paris";
    const sameOrlySecretary =
      callerRole === "manager_orly" &&
      targetCurrentRole === "secretary_orly" &&
      targetRole === "secretary_orly";
    const sameManagedSecretary =
      callerRole === "manager" &&
      targetCurrentRole === targetRole &&
      isSecretaryRole(targetRole) &&
      centerListContains(callerManagedCenterIds, roleCenter(targetRole));

    if (!sameParisSecretary && !sameOrlySecretary && !sameManagedSecretary) {
      throw new HttpsError("permission-denied", "Modification de role staff non autorisee");
    }
  }

  if (callerRole === "manager_paris") {
    if (targetRole === "secretary_paris") return;
    if (targetRole === "client") return assertClientCenterAllowed({ role: callerRole, managedCenterIds: callerManagedCenterIds }, clientData);
  }

  if (callerRole === "manager_orly") {
    if (targetRole === "secretary_orly") return;
    if (targetRole === "client") return assertClientCenterAllowed({ role: callerRole, managedCenterIds: callerManagedCenterIds }, clientData);
  }

  if (callerRole === "manager") {
    if (
      isSecretaryRole(targetRole) &&
      centerListContains(callerManagedCenterIds, roleCenter(targetRole))
    ) {
      return;
    }

    if (targetRole === "client") {
      return assertClientCenterAllowed(
        { role: callerRole, managedCenterIds: callerManagedCenterIds },
        clientData
      );
    }
  }

  if (callerRole === "secretary_paris" || callerRole === "secretary_orly") {
    if (targetRole === "client") return assertClientCenterAllowed({ role: callerRole, managedCenterIds: callerManagedCenterIds }, clientData);
  }

  throw new HttpsError("permission-denied", "Changement de role non autorise");
}

function claimsForRole(role: UserRole, managedCenterIds: AddressId[]): Record<string, string | string[]> {
  const claims: Record<string, string | string[]> = { role };
  const managedAddressId = managedCenterIds[0] || roleCenter(role);

  if (managedAddressId) {
    claims.managedAddressId = managedAddressId;
    claims.managedCenterIds = managedCenterIds.length > 0 ? managedCenterIds : [managedAddressId];
  }

  return claims;
}

async function ensureDirectClientCreationInvoice(params: {
  db: admin.firestore.Firestore;
  uid: string;
  callerUid: string;
  callerRole: StaffRole;
  clientPayload: Record<string, any>;
  planId: PlanId;
  paymentFrequency: BillingFrequency;
  addressKey: string;
  addressId: AddressId;
}): Promise<{ invoiceId: string; created: boolean }> {
  const {
    db,
    uid,
    callerUid,
    callerRole,
    clientPayload,
    planId,
    paymentFrequency,
    addressKey,
    addressId,
  } = params;

  const invoiceId = invoiceIdForDirectClientCreation(uid);
  const invoiceRef = db.collection("invoices").doc(invoiceId);
  const clientRef = db.collection("clients").doc(uid);
  const requestRef = db.collection("client_requests").doc(uid);
  let created = false;

  await db.runTransaction(async (transaction) => {
    const invoiceSnap = await transaction.get(invoiceRef);
    const nowTs = admin.firestore.FieldValue.serverTimestamp();
    const periodStartDate = new Date();
    const periodEndDate = addBillingPeriod(periodStartDate, paymentFrequency);
    const periodStart = admin.firestore.Timestamp.fromDate(periodStartDate);
    const periodEnd = admin.firestore.Timestamp.fromDate(periodEndDate);
    const amountCents = planAmountCents(planId, paymentFrequency);

    const subscriptionPatch = {
      paymentStatus: "paid",
      subscriptionStatus: "active",
      subscriptionPlan: planId,
      subscriptionAmountCents: amountCents,
      paymentFrequency,
      subscriptionRenewalDate: periodEnd,
      subscriptionActivatedAt: nowTs,
      subscriptionSource: "admin_direct_creation",
      billingMode: "manual_admin_activation",
      requiresRecurringPaymentSetup: true,
      recurringPaymentSetup: {
        status: "required",
        planId,
        frequency: paymentFrequency,
        source: "admin_direct_creation",
        updatedAt: nowTs,
      },
      initialInvoiceId: invoiceId,
      invoiceId,
      lastInvoiceId: invoiceId,
      invoiceIds: admin.firestore.FieldValue.arrayUnion(invoiceId),
      subscription: {
        plan: planId,
        frequency: paymentFrequency,
        status: "active",
        amountCents,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        activatedAt: nowTs,
        source: "admin_direct_creation",
      },
      updatedAt: nowTs,
    };

    if (invoiceSnap.exists) {
      transaction.set(clientRef, subscriptionPatch, { merge: true });
      transaction.set(
        requestRef,
        {
          invoiceId,
          paymentStatus: "paid",
          invoiceIds: admin.firestore.FieldValue.arrayUnion(invoiceId),
          updatedAt: nowTs,
        },
        { merge: true }
      );
      return;
    }

    const currentYear = new Date().getFullYear();
    const counterRef = db.doc(`counters/invoices_${currentYear}`);
    const counterSnap = await transaction.get(counterRef);
    const nextNumber = (counterSnap.exists ? Number(counterSnap.data()?.lastNumber || 0) : 0) + 1;
    const invoiceNumber = `FAC-${currentYear}-${String(nextNumber).padStart(4, "0")}`;

    const invoicePayload = {
      id: invoiceId,
      invoiceNumber,
      status: INVOICE_STATUS.PAID,
      amountCents,
      currency: "EUR",
      addressKey,
      addressId,
      centerId: addressId,
      requestId: uid,
      clientId: uid,
      issuedAt: nowTs,
      paidAt: nowTs,
      dueDate: nowTs,
      type: "subscription",
      source: "admin_direct_creation",
      createdBy: callerUid,
      createdByRole: callerRole,
      description: `Abonnement de domiciliation ${PLAN_LABELS[planId]} - ${billingFrequencyLabel(paymentFrequency)}`,
      planId,
      paymentFrequency,
      billingPeriod: {
        start: periodStart,
        end: periodEnd,
        frequency: paymentFrequency,
      },
      snapshot: {
        client: {
          name: clientPayload.companyName || clientPayload.name || "Client",
          email: clientPayload.email || "",
          address: clientPayload.address || "",
          siret: clientPayload.siret || clientPayload.siretNorm || "En cours d'immatriculation",
        },
        seller: buildInvoiceSellerSnapshot(addressKey),
      },
      manualActivation: {
        enabled: true,
        activatedBy: callerUid,
        activatedByRole: callerRole,
        activatedAt: nowTs,
      },
      pdf: {
        status: PDF_STATUS.PENDING,
        createdAt: nowTs,
        updatedAt: nowTs,
      },
      createdAt: nowTs,
      updatedAt: nowTs,
    };

    transaction.set(invoiceRef, invoicePayload);
    transaction.set(counterRef, { lastNumber: nextNumber, updatedAt: nowTs }, { merge: true });
    transaction.set(clientRef, subscriptionPatch, { merge: true });
    transaction.set(
      requestRef,
      {
        invoiceId,
        paymentStatus: "paid",
        invoiceIds: admin.firestore.FieldValue.arrayUnion(invoiceId),
        updatedAt: nowTs,
      },
      { merge: true }
    );

    created = true;
  });

  return { invoiceId, created };
}

export const setRole = onCall({ region: "europe-west9", cors: true }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Auth requise");

  const { email, password, newRole, displayName, clientData } = request.data as any;

  if (!email || !newRole || !displayName) {
    throw new HttpsError("invalid-argument", "Champs requis manquants");
  }

  const targetRole = normalizeRole(newRole);
  if (!targetRole) {
    throw new HttpsError("invalid-argument", "Role invalide");
  }

  const requestedManagedCenterIds = resolveRequestedManagedCenterIds(request.data);
  const targetManagedCenterIds = managedCentersForRole(targetRole, requestedManagedCenterIds);

  if (targetRole === "manager" && targetManagedCenterIds.length === 0) {
    throw new HttpsError("invalid-argument", "managedCenterIds requis pour un gestionnaire multi-centres");
  }

  let createdAuthUid: string | null = null;
  let firestoreCommitted = false;
  let directInvoiceParams: {
    clientPayload: Record<string, any>;
    planId: PlanId;
    paymentFrequency: BillingFrequency;
    addressKey: string;
    addressId: AddressId;
  } | null = null;
  let directInvoiceResult: { invoiceId: string; created: boolean } | null = null;
  let directPdfResult:
    | { ok: boolean; idempotent?: boolean; contractId?: string | null; attestationId?: string | null }
    | null = null;

  try {
    const db = admin.firestore();
    const caller = await resolveCaller(request);
    const emailLower = normalizeEmailLower(email);

    if (targetRole === "manager") {
      await assertManagedCentersExist(db, targetManagedCenterIds);
    }

    // Preflight before creating an Auth user, to avoid orphan accounts on denied role requests.
    assertRoleChangeAllowed({
      callerUid: caller.uid,
      callerRole: caller.role,
      callerManagedCenterIds: caller.managedCenterIds,
      targetUid: "",
      targetCurrentRole: null,
      targetRole,
      clientData,
    });

    let userRecord: admin.auth.UserRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(emailLower);
      logger.info("[setRole] User exists", { uid: userRecord.uid, email: emailLower });
    } catch (err: any) {
      if (err?.code !== "auth/user-not-found") {
        throw err;
      }
      const creationPassword =
        typeof password === "string" && password.length >= 6
          ? password
          : targetRole === "client"
            ? randomClientActivationPassword()
            : "";

      if (!creationPassword) {
        throw new HttpsError("invalid-argument", "Mot de passe requis pour creation");
      }
      if (targetRole === "client" && !clientData) {
        throw new HttpsError("invalid-argument", "clientData requis pour creation client");
      }

      userRecord = await admin.auth().createUser({
        email: emailLower,
        password: creationPassword,
        displayName,
      });
      createdAuthUid = userRecord.uid;
      logger.info("[setRole] User created", { uid: userRecord.uid, email: emailLower });
    }

    const userRef = db.collection("users").doc(userRecord.uid);
    const userSnap = await userRef.get();
    const targetCurrentRole = normalizeRole(userSnap.data()?.role);

    assertRoleChangeAllowed({
      callerUid: caller.uid,
      callerRole: caller.role,
      callerManagedCenterIds: caller.managedCenterIds,
      targetUid: userRecord.uid,
      targetCurrentRole,
      targetRole,
      clientData,
    });

    if (targetRole === "client" && !clientData && !userSnap.exists) {
      throw new HttpsError("invalid-argument", "clientData requis pour un client");
    }

    const batch = db.batch();
    const nowTs = admin.firestore.FieldValue.serverTimestamp();
    const managedAddressId = targetManagedCenterIds[0] || null;

    const userPatch: Record<string, any> = {
      uid: userRecord.uid,
      email: emailLower,
      emailLower,
      role: targetRole,
      displayName,
      managedAddressId,
      managedCenterIds: targetManagedCenterIds,
      updatedAt: nowTs,
    };

    if (!userSnap.exists) {
      userPatch.createdAt = nowTs;
    }

    batch.set(userRef, userPatch, { merge: true });

    if (targetRole === "client" && clientData) {
      const companyName = resolveCompanyName(clientData);
      const representative = resolveRepresentative(clientData);
      const representativeAddress = resolveRepresentativeAddress(clientData);
      const legalStatus = resolveLegalStatusFromClientData(clientData);
      const representativeQuality = resolveRepresentativeQuality(clientData);
      const shareCapital = resolveShareCapital(clientData);

      if (!representativeAddress) {
        throw new HttpsError("invalid-argument", "Adresse personnelle du representant requise");
      }
      if (!legalStatus) {
        throw new HttpsError("invalid-argument", "Statut juridique requis");
      }
      if (!representativeQuality) {
        throw new HttpsError("invalid-argument", "Qualite du representant requise");
      }

      const domiciliationAddressId = resolveAddressIdFromClientData(clientData);
      if (!domiciliationAddressId) {
        throw new HttpsError(
          "invalid-argument",
          "Adresse invalide (domiciliationAddressId/addressId/addressKey)"
        );
      }

      assertClientCenterAllowed(caller, clientData);

      const planId = resolvePlanIdFromClientData(clientData);
      const paymentFrequency = normalizeBillingFrequency(clientData?.paymentFrequency);

      const siretNorm = normalizeSiret(clientData?.siret || clientData?.siretNorm);
      if (!siretNorm || siretNorm.length < 14) {
        throw new HttpsError("invalid-argument", "SIRET invalide ou manquant");
      }

      const status: ClientStatus = (clientData?.status as ClientStatus) || CLIENT_STATUS.PENDING;
      const resolvedAddressId = domiciliationAddressId;
      const resolvedAddressKey = addressKeyForCenter(domiciliationAddressId);
      const createdAtDate = new Date();
      const billingPeriodStart = admin.firestore.Timestamp.fromDate(createdAtDate);
      const billingPeriodEnd = admin.firestore.Timestamp.fromDate(addBillingPeriod(createdAtDate, paymentFrequency));
      const subscriptionAmountCents = planAmountCents(planId, paymentFrequency);
      const clientPayload = {
        type: "account",
        createdFrom: "admin",
        uid: userRecord.uid,
        ownerUid: userRecord.uid,
        centerId: resolvedAddressId,
        companyName,
        email: emailLower,
        emailLower,
        phone: (clientData?.phone || "").toString().trim(),
        siret: siretNorm,
        siretNorm,
        domiciliationAddressId,
        planId,
        paymentFrequency,
        status,
        paymentStatus: "paid",
        subscriptionStatus: "active",
        subscriptionPlan: planId,
        subscriptionAmountCents,
        subscriptionRenewalDate: billingPeriodEnd,
        subscriptionActivatedAt: nowTs,
        subscriptionSource: "admin_direct_creation",
        billingMode: "manual_admin_activation",
        requiresRecurringPaymentSetup: true,
        recurringPaymentSetup: {
          status: "required",
          planId,
          frequency: paymentFrequency,
          source: "admin_direct_creation",
          updatedAt: nowTs,
        },
        accessProvisioned: true,
        accessProvisionedAt: nowTs,
        accessProvisionedReason: null,

        // Legacy compatibility UI
        name: companyName,
        representative,
        signatoryName: representative,
        legalStatus,
        legalStatusText: legalStatus,
        formeJuridique: legalStatus,
        quality: representativeQuality,
        representativeQuality,
        address: representativeAddress,
        representativeAddress,
        personalAddress: representativeAddress,
        homeAddress: representativeAddress,
        ...(shareCapital ? { shareCapital } : {}),
        plan: planId,
        mailPlanId: planId,
        tier: planId === "business" ? "pro" : planId,
        addressId: resolvedAddressId,
        addressKey: resolvedAddressKey,
        locationKey: resolvedAddressKey,
        subscription: {
          plan: planId,
          frequency: paymentFrequency,
          status: "active",
          amountCents: subscriptionAmountCents,
          currentPeriodStart: billingPeriodStart,
          currentPeriodEnd: billingPeriodEnd,
          activatedAt: nowTs,
          source: "admin_direct_creation",
        },

        joinDate: nowTs,
        updatedAt: nowTs,
      };

      directInvoiceParams = {
        clientPayload,
        planId,
        paymentFrequency,
        addressKey: resolvedAddressKey,
        addressId: resolvedAddressId,
      };

      batch.set(
        db.collection("clients").doc(userRecord.uid),
        clientPayload,
        { merge: true }
      );

      const requestRef = db.collection("client_requests").doc(userRecord.uid);
      const requestSnap = await requestRef.get();
      batch.set(
        requestRef,
        buildAdminClientRequestMirror({
          uid: userRecord.uid,
          actorUid: caller.uid,
          now: nowTs,
          clientData: clientPayload,
          requestData: requestSnap.data() || {},
        }),
        { merge: true }
      );
    }

    batch.set(db.collection("activity_logs").doc(), {
      type: "user.role_set",
      createdAt: nowTs,
      actorUid: caller.uid,
      actorRole: caller.role,
      targetUid: userRecord.uid,
      targetEmail: emailLower,
      fromRole: targetCurrentRole || null,
      toRole: targetRole,
      centerId: managedAddressId || resolveAddressIdFromClientData(clientData) || null,
      centerIds: targetManagedCenterIds,
      createdAuthUser: Boolean(createdAuthUid),
    });

    await batch.commit();
    firestoreCommitted = true;

    if (targetRole === "client" && directInvoiceParams) {
      directInvoiceResult = await ensureDirectClientCreationInvoice({
        db,
        uid: userRecord.uid,
        callerUid: caller.uid,
        callerRole: caller.role,
        clientPayload: directInvoiceParams.clientPayload,
        planId: directInvoiceParams.planId,
        paymentFrequency: directInvoiceParams.paymentFrequency,
        addressKey: directInvoiceParams.addressKey,
        addressId: directInvoiceParams.addressId,
      });

      try {
        directPdfResult = await performCreatePdfJobs(
          userRecord.uid,
          userRecord.uid,
          {
            ...directInvoiceParams.clientPayload,
            invoiceId: directInvoiceResult.invoiceId,
            paymentStatus: "paid",
            status: "approved",
            source: "admin_manual_client",
          }
        );
      } catch (pdfError: any) {
        const message =
          pdfError?.message ||
          "Impossible de mettre en file le contrat et l'attestation.";

        logger.error("[setRole] Direct client PDF job creation failed", {
          uid: userRecord.uid,
          message,
          stack: pdfError?.stack,
        });

        await db.collection("client_requests").doc(userRecord.uid).set(
          {
            pdfPublish: {
              contract: {
                status: "error",
                error: message,
                updatedAt: new Date().toISOString(),
              },
              attestation: {
                status: "error",
                error: message,
                updatedAt: new Date().toISOString(),
              },
            },
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
    }

    await admin.auth().setCustomUserClaims(userRecord.uid, claimsForRole(targetRole, targetManagedCenterIds));

    let activationEmailSent = false;
    let activationEmailAlreadySent = false;

    if (
      targetRole === "client" &&
      directInvoiceParams &&
      request.data?.sendActivationEmail !== false &&
      isValidEmail(emailLower)
    ) {
      const clientRef = db.collection("clients").doc(userRecord.uid);
      const requestRef = db.collection("client_requests").doc(userRecord.uid);
      const [clientSnap, requestSnap] = await Promise.all([clientRef.get(), requestRef.get()]);
      activationEmailAlreadySent =
        clientSnap.data()?.activationEmailSent === true ||
        requestSnap.data()?.activationEmailSent === true;

      if (!activationEmailAlreadySent) {
        try {
          const passwordSetupLink = await buildPasswordSetupLink(emailLower);
          await queueActivationEmail(
            emailLower,
            buildClientActivationHtml({
              companyName: directInvoiceParams.clientPayload.companyName || "",
              displayName: displayName || directInvoiceParams.clientPayload.representative || "",
              link: passwordSetupLink,
            })
          );
          activationEmailSent = true;
        } catch (activationError: any) {
          logger.warn("[setRole] Direct client activation email failed", {
            uid: userRecord.uid,
            email: emailLower,
            message: activationError?.message,
          });
        }
      }

      if (activationEmailSent || activationEmailAlreadySent) {
        const nowTs = admin.firestore.FieldValue.serverTimestamp();
        const portalAccess = {
          status: "invited",
          invitedAt: nowTs,
          invitedBy: caller.uid,
          lastInvitationSentAt: nowTs,
          lastInvitationSentBy: caller.uid,
          email: emailLower,
        };

        const activationPatch = {
          accessProvisioned: true,
          accessProvisionedAt: nowTs,
          accessProvisionedReason: null,
          activationEmailSent: true,
          activationEmailSentAt: nowTs,
          portalAccess,
          updatedAt: nowTs,
        };

        const activationBatch = db.batch();
        activationBatch.set(clientRef, activationPatch, { merge: true });
        activationBatch.set(requestRef, activationPatch, { merge: true });
        activationBatch.set(
          db.collection("users").doc(userRecord.uid),
          {
            accountStatus: "invited",
            portalAccess,
            updatedAt: nowTs,
          },
          { merge: true }
        );
        activationBatch.set(
          db.collection("customers").doc(userRecord.uid),
          {
            accountStatus: "invited",
            portalAccess,
            updatedAt: nowTs,
          },
          { merge: true }
        );
        await activationBatch.commit();
      }
    }

    return {
      success: true,
      uid: userRecord.uid,
      role: targetRole,
      managedCenterIds: targetManagedCenterIds,
      invoiceId: directInvoiceResult?.invoiceId || null,
      invoiceCreated: directInvoiceResult?.created === true,
      pdfJobs: directPdfResult
        ? {
            contractId: directPdfResult.contractId || null,
            attestationId: directPdfResult.attestationId || null,
            idempotent: directPdfResult.idempotent === true,
          }
        : null,
      subscriptionStatus: targetRole === "client" ? "active" : null,
      activationEmailSent,
      activationEmailAlreadySent,
    };
  } catch (err: any) {
    if (createdAuthUid && !firestoreCommitted) {
      try {
        await admin.auth().deleteUser(createdAuthUid);
      } catch (cleanupError: any) {
        logger.warn("[setRole] Failed to cleanup newly-created auth user", {
          uid: createdAuthUid,
          message: cleanupError?.message,
        });
      }
    }

    logger.error("[setRole] error:", err?.message || err);
    if (err instanceof HttpsError) throw err;
    throw new HttpsError("internal", err?.message || "Erreur interne");
  }
});


