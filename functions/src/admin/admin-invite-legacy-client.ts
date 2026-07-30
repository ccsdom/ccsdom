import { randomBytes } from "node:crypto";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import {
  canManageClientsRole,
  canTouchCenter,
  getCallerAccess,
  resolveCenterIdFromData,
} from "../_utils/auth";
import { performCreatePdfJobs } from "../pdfJobs";

if (!admin.apps.length) admin.initializeApp();

const LOGIN_URL = "https://ccsdom.fr/login";

function normalizeString(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeEmail(value: unknown) {
  return normalizeString(value).toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === "function") return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toTimestamp(value: any): admin.firestore.Timestamp | null {
  const date = toDate(value);
  return date ? admin.firestore.Timestamp.fromDate(date) : null;
}

function toIsoString(value: any): string | null {
  const date = toDate(value);
  return date ? date.toISOString() : null;
}

function formatDateFr(value: any): string {
  const date = toDate(value);
  if (!date) return "";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function resolveAddressId(data: Record<string, any>) {
  const raw = normalizeString(
    data.domiciliationAddressId ||
      data.addressId ||
      data.centerId ||
      data.locationKey ||
      data.addressKey
  ).toLowerCase();

  if (raw === "orly" || raw === "orly_ville") return "orly_ville";
  if (raw === "paris" || raw === "paris_12e") return "paris_12e";
  return raw || "";
}

function resolveAddressKey(data: Record<string, any>, addressId: string) {
  const raw = normalizeString(data.addressKey || data.locationKey).toLowerCase();
  if (raw === "orly" || raw === "paris") return raw;
  if (addressId === "orly_ville") return "orly";
  if (addressId === "paris_12e") return "paris";
  return raw || "";
}

function resolveLegacyEffectiveDate(clientData: Record<string, any>) {
  return (
    toTimestamp(clientData.contractEffectiveAt) ||
    toTimestamp(clientData.effectiveAt) ||
    toTimestamp(clientData.joinDate) ||
    toTimestamp(clientData.createdAt) ||
    null
  );
}

function randomPassword() {
  return `${randomBytes(18).toString("base64url")}Aa1!`;
}

function isLegacyImportedClient(data: Record<string, any>) {
  return (
    data.createdFrom === "legacy_import" ||
    data.billingMode === "legacy_import_no_billing" ||
    Boolean(data.legacyImport?.source)
  );
}

function isPortalManagedClient(data: Record<string, any>) {
  return (
    isLegacyImportedClient(data) ||
    data.createdFrom === "admin" ||
    data.billingMode === "manual_admin_activation" ||
    data.subscriptionSource === "admin_direct_creation"
  );
}

async function getAuthUserByEmail(email: string) {
  try {
    return await admin.auth().getUserByEmail(email);
  } catch (error: any) {
    if (error?.code === "auth/user-not-found") return null;
    throw error;
  }
}

async function getAuthUserByUid(uid: string) {
  try {
    return await admin.auth().getUser(uid);
  } catch (error: any) {
    if (error?.code === "auth/user-not-found") return null;
    throw error;
  }
}

async function queueEmail(to: string, subject: string, html: string) {
  await admin.firestore().collection("mails").add({
    to: [to],
    message: { subject, html },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function buildPasswordSetupLink(email: string) {
  return admin.auth().generatePasswordResetLink(email, {
    url: LOGIN_URL,
    handleCodeInApp: false,
  });
}

function buildInvitationHtml(args: {
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
      <p>Pour finaliser votre accès, cliquez sur le bouton ci-dessous et définissez votre mot de passe sécurisé.</p>
      <p>Une fois connecté, ouvrez la rubrique <strong>Abonnement</strong> afin d'activer le prélèvement récurrent Stripe de vos prochaines factures.</p>
      <p style="margin-top:18px">
        <a href="${args.link}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">
          Activer mon espace client
        </a>
      </p>
      <p style="margin-top:18px;font-size:13px;color:#4b5563">
        Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.
      </p>
      <p style="margin-top:22px">— <strong>CCS DOM</strong></p>
    </div>
  `;
}

function buildLegacyClientRequestMirror(args: {
  clientId: string;
  clientData: Record<string, any>;
  actorUid: string;
  email: string;
  companyName: string;
  displayName: string;
  portalAccess?: Record<string, any> | null;
}) {
  const { clientId, clientData, actorUid, email, companyName, displayName, portalAccess } = args;
  const addressId = resolveAddressId(clientData);
  const addressKey = resolveAddressKey(clientData, addressId);
  const effectiveDate = resolveLegacyEffectiveDate(clientData);
  const effectiveDateDisplay = formatDateFr(effectiveDate) || formatDateFr(new Date());
  const signedAt = toIsoString(clientData.signedAt) || toIsoString(effectiveDate) || new Date().toISOString();
  const legalStatus = normalizeString(clientData.legalStatus || clientData.formeJuridique);
  const siret = normalizeString(clientData.siretNorm || clientData.siret);
  const planId = normalizeString(clientData.planId || clientData.plan || clientData.mailPlanId);

  return {
    uid: clientId,
    ownerUid: clientId,
    requestUid: clientId,
    companyName,
    name: companyName,
    representative: displayName || normalizeString(clientData.representative),
    signatoryName:
      normalizeString(clientData.signatoryName) ||
      displayName ||
      companyName ||
      "Le domicilie",
    email,
    emailLower: email,
    phone: normalizeString(clientData.phone),
    siret,
    siretNorm: siret || null,
    address: normalizeString(clientData.address),
    addressId: addressId || null,
    domiciliationAddressId: addressId || null,
    addressKey: addressKey || normalizeString(clientData.addressKey) || "orly",
    locationKey: addressKey || normalizeString(clientData.locationKey) || "orly",
    legalStatus,
    formeJuridique: legalStatus,
    mailPlanId: planId || null,
    planId: planId || null,
    plan: planId || null,
    paymentFrequency: clientData.paymentFrequency || "monthly",
    paymentStatus: clientData.paymentStatus || "legacy_import",
    subscriptionStatus: clientData.subscriptionStatus || "active",
    source: "legacy_import",
    createdFrom: "legacy_import",
    status: "approved",
    accessProvisioned: true,
    accessProvisionedReason: "legacy_import_portal_invitation",
    accessProvisionedAt:
      clientData.accessProvisionedAt ||
      portalAccess?.invitedAt ||
      admin.firestore.FieldValue.serverTimestamp(),
    approvedAt: clientData.approvedAt || effectiveDate || clientData.joinDate || clientData.createdAt,
    approvedBy: normalizeString(clientData.approvedBy) || actorUid,
    createdAt: clientData.joinDate || clientData.createdAt || effectiveDate || admin.firestore.FieldValue.serverTimestamp(),
    joinDate: clientData.joinDate || effectiveDate || null,
    signedAt,
    signedAtDisplay: formatDateFr(signedAt) || effectiveDateDisplay,
    today: effectiveDateDisplay,
    A_COMPTER_DU: effectiveDateDisplay,
    effectiveDateDisplay,
    suppressDocumentReadyEmail: true,
    legacyImport: clientData.legacyImport || null,
    pdfJobs: clientData.pdfJobs || {},
    pdfPublish: clientData.pdfPublish || {},
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

async function ensureLegacyClientPdfJobs(args: {
  clientId: string;
  clientData: Record<string, any>;
  actorUid: string;
  email: string;
  companyName: string;
  displayName: string;
  portalAccess?: Record<string, any> | null;
}) {
  const db = admin.firestore();
  const mirror = buildLegacyClientRequestMirror(args);
  await db.collection("client_requests").doc(args.clientId).set(mirror, { merge: true });
  return performCreatePdfJobs(args.clientId, args.clientId, mirror);
}

export const adminInviteLegacyClient = onCall(
  { region: "europe-west9", cors: true },
  async (req) => {
    const caller = await getCallerAccess(req);
    const actorUid = caller.uid;
    const role = caller.role;

    if (!canManageClientsRole(role)) {
      throw new HttpsError("permission-denied", "Droits insuffisants.");
    }

    const clientId = normalizeString(req.data?.clientId);
    const force = Boolean(req.data?.force);

    if (!clientId) {
      throw new HttpsError("invalid-argument", "clientId requis.");
    }

    const db = admin.firestore();
    const clientRef = db.collection("clients").doc(clientId);
    const clientSnap = await clientRef.get();

    if (!clientSnap.exists) {
      throw new HttpsError("not-found", "Client introuvable.");
    }

    const clientData = clientSnap.data() || {};
    const centerId = resolveCenterIdFromData(clientData);
    const hasStripeSubscription = normalizeString(clientData.stripeCheckout?.subscriptionId) !== "";

    if (!canTouchCenter(role, caller.managedCenterIds, centerId)) {
      throw new HttpsError("permission-denied", "Vous ne pouvez pas inviter un client hors de votre centre.");
    }

    const legacyImported = isLegacyImportedClient(clientData);

    if (!isPortalManagedClient(clientData)) {
      throw new HttpsError(
        "failed-precondition",
        "Ce client n'est pas éligible à l'invitation portail."
      );
    }

    const email = normalizeEmail(clientData.emailLower || clientData.email);
    if (!email || !isValidEmail(email)) {
      throw new HttpsError("failed-precondition", "E-mail client absent ou invalide.");
    }

    const companyName = normalizeString(clientData.companyName || clientData.name);
    const displayName = normalizeString(clientData.representative || clientData.signatoryName || companyName);

    if (clientData.portalAccess?.status === "invited" && !force) {
      let pdfResult: any = null;
      try {
        pdfResult = await ensureLegacyClientPdfJobs({
          clientId,
          clientData,
          actorUid,
          email,
          companyName,
          displayName,
          portalAccess: clientData.portalAccess || null,
        });
      } catch (pdfError: any) {
        logger.error("[adminInviteLegacyClient] generation PDF legacy deja invitee echouee", {
          clientId,
          email,
          message: pdfError?.message,
        });
      }

      return {
        ok: true,
        deduped: true,
        status: "already_invited",
        invitedAt: clientData.portalAccess?.invitedAt ?? null,
        pdfJobs: pdfResult
          ? {
              contractId: pdfResult.contractId || null,
              attestationId: pdfResult.attestationId || null,
              idempotent: pdfResult.idempotent === true,
            }
          : null,
      };
    }

    const existingByEmail = await getAuthUserByEmail(email);
    if (existingByEmail && existingByEmail.uid !== clientId) {
      throw new HttpsError(
        "already-exists",
        "Un autre compte d'authentification utilise déjà cet e-mail."
      );
    }

    let authUser = await getAuthUserByUid(clientId);
    if (authUser) {
      authUser = await admin.auth().updateUser(clientId, {
        email,
        displayName: displayName || companyName || email,
        disabled: false,
      });
    } else {
      authUser = await admin.auth().createUser({
        uid: clientId,
        email,
        password: randomPassword(),
        displayName: displayName || companyName || email,
        disabled: false,
        emailVerified: false,
      });
    }

    await admin.auth().setCustomUserClaims(authUser.uid, { role: "client" });

    const passwordSetupLink = await buildPasswordSetupLink(email);
    await queueEmail(
      email,
      "Activez votre espace client CCS DOM",
      buildInvitationHtml({ companyName, displayName, link: passwordSetupLink })
    );

    const now = admin.firestore.FieldValue.serverTimestamp();
    const portalAccess = {
      status: "invited",
      invitedAt: now,
      invitedBy: actorUid,
      lastInvitationSentAt: now,
      lastInvitationSentBy: actorUid,
      email,
    };

    const batch = db.batch();
    const clientPatch: Record<string, any> = {
        accessProvisioned: true,
        accessProvisionedAt: now,
        activationEmailSent: true,
        activationEmailSentAt: now,
        portalAccess,
        requiresRecurringPaymentSetup: !hasStripeSubscription,
        recurringPaymentSetup: hasStripeSubscription
          ? {
              status: "active",
              subscriptionId: clientData.stripeCheckout?.subscriptionId || null,
              updatedAt: now,
            }
          : {
              status: "required",
              planId: clientData.planId || clientData.mailPlanId || clientData.plan || "classic",
              frequency: clientData.paymentFrequency || clientData.subscription?.frequency || "monthly",
              source: "legacy_import_invitation",
              updatedAt: now,
            },
        updatedAt: now,
      };

    if (legacyImported) {
      clientPatch.legacyImport = {
          authDisabled: false,
          invitedAt: now,
          invitedBy: actorUid,
        };
    }

    batch.set(
      clientRef,
      clientPatch,
      { merge: true }
    );

    batch.set(
      db.collection("users").doc(clientId),
      {
        uid: clientId,
        email,
        emailLower: email,
        displayName: displayName || companyName || email,
        role: "client",
        disabled: false,
        accountStatus: "invited",
        portalAccess,
        clientId,
        updatedAt: now,
      },
      { merge: true }
    );

    batch.set(db.collection("activity_logs").doc(), {
      type: "client.portal_invited",
      actorUid,
      actorRole: role,
      clientId,
      targetUid: clientId,
      targetEmail: email,
      centerId,
      centerIds: centerId ? [centerId] : [],
      createdAt: now,
      details: {
        companyName,
        source: "legacy_import_invitation",
      },
    });

    await batch.commit();

    let pdfResult: any = null;
    try {
      pdfResult = await ensureLegacyClientPdfJobs({
        clientId,
        clientData: {
          ...clientData,
          accessProvisioned: true,
          activationEmailSent: true,
          portalAccess,
          legacyImport: legacyImported
            ? {
                ...(clientData.legacyImport || {}),
                authDisabled: false,
                invitedAt: now,
                invitedBy: actorUid,
              }
            : clientData.legacyImport,
        },
        actorUid,
        email,
        companyName,
        displayName,
        portalAccess,
      });
    } catch (pdfError: any) {
      const message =
        pdfError?.message ||
        "Impossible de mettre en file le contrat et l'attestation du client importe.";

      logger.error("[adminInviteLegacyClient] generation PDF legacy echouee", {
        clientId,
        email,
        message,
        stack: pdfError?.stack,
      });

      await db.collection("client_requests").doc(clientId).set(
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
          suppressDocumentReadyEmail: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    logger.info("[adminInviteLegacyClient] invitation envoyee", {
      clientId,
      email,
      centerId,
      actorUid,
      pdfJobs: pdfResult
        ? {
            contractId: pdfResult.contractId || null,
            attestationId: pdfResult.attestationId || null,
            idempotent: pdfResult.idempotent === true,
          }
        : null,
    });

    return {
      ok: true,
      deduped: false,
      clientId,
      email,
      status: "invited",
      pdfJobs: pdfResult
        ? {
            contractId: pdfResult.contractId || null,
            attestationId: pdfResult.attestationId || null,
            idempotent: pdfResult.idempotent === true,
          }
        : null,
    };
  }
);
