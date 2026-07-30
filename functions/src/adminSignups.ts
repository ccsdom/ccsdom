// functions/src/adminSignups.ts

import { randomBytes } from "node:crypto";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { SIGNUP_REQUEST_STATUS, CLIENT_STATUS } from "./_config/signup-constants";
import {
  mapRequestToClient,
  normalizeString,
  normalizeEmailLower,
} from "./_utils/client-mapper";

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

const STAFF_ROLES = new Set([
  "admin",
  "superadmin",
  "manager",
  "manager_paris",
  "manager_orly",
]);

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function generateTemporaryPassword() {
  const core = randomBytes(12).toString("base64url");
  return `${core}Aa1!`;
}

async function requireStaff(authUid: string) {
  const userSnap = await db.doc(`users/${authUid}`).get();
  const role = normalizeString(userSnap.data()?.role);

  if (!role || !STAFF_ROLES.has(role)) {
    throw new HttpsError(
      "permission-denied",
      "Vous n'avez pas les droits nécessaires pour cette action."
    );
  }

  return {
    role,
    user: userSnap.data() || {},
  };
}

async function queueEmail(
  to: string | string[],
  subject: string,
  html: string
) {
  const recipients = Array.isArray(to) ? to : [to];

  await db.collection("mails").add({
    to: recipients,
    message: { subject, html },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function buildPasswordSetupLink(email: string) {
  return admin.auth().generatePasswordResetLink(email, {
    url: "https://ccsdom.fr/login",
    handleCodeInApp: false,
  });
}

function buildHtml(
  title: string,
  intro: string,
  ctaText?: string,
  ctaUrl?: string
) {
  const cta =
    ctaText && ctaUrl
      ? `<p style="margin-top:16px"><a href="${ctaUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px">${ctaText}</a></p>`
      : "";

  return `
    <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111827">
      <h2 style="margin:0 0 12px">${title}</h2>
      <p>${intro}</p>
      ${cta}
      <p style="margin-top:20px">— <strong>CCS-DOM</strong></p>
    </div>
  `;
}

async function ensureClientAccess(args: {
  uid: string;
  email: string;
  displayName: string;
  companyName: string;
}): Promise<{ provisioned: boolean; reason: string | null }> {
  const auth = admin.auth();
  const email = normalizeEmailLower(args.email);

  if (!email || !isValidEmail(email)) {
    return { provisioned: false, reason: "invalid_email" };
  }

  try {
    const existingByEmail = await auth.getUserByEmail(email).catch(() => null);

    if (existingByEmail && existingByEmail.uid !== args.uid) {
      throw new HttpsError(
        "already-exists",
        "Un compte d'authentification existe déjà pour cet email."
      );
    }

    const displayName =
      normalizeString(args.displayName) ||
      normalizeString(args.companyName) ||
      email;

    const existingByUid = await auth.getUser(args.uid).catch(() => null);

    if (existingByUid) {
      await auth.updateUser(args.uid, {
        email,
        displayName,
        disabled: false,
      });
    } else {
      const tempPassword = generateTemporaryPassword();

      await auth.createUser({
        uid: args.uid,
        email,
        password: tempPassword,
        displayName,
        disabled: false,
        emailVerified: false,
      });
    }

    await auth.setCustomUserClaims(args.uid, {
      role: "client",
    });

    return { provisioned: true, reason: null };
  } catch (error) {
    if (error instanceof HttpsError) throw error;

    throw new HttpsError(
      "internal",
      "Impossible de provisionner l'accès client."
    );
  }
}

/**
 * Logique de provisionnement partagée et idempotente
 * Gère uniquement l'accès technique et la notification, sans changer le statut métier.
 */
async function performProvisioning(requestUid: string, actorUid: string) {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const requestRef = db.doc(`client_requests/${requestUid}`);
  const requestSnap = await requestRef.get();

  if (!requestSnap.exists) {
    throw new HttpsError("not-found", "Demande introuvable.");
  }

  const requestData = (requestSnap.data() || {}) as Record<string, any>;
  const ownerUid = normalizeString(requestData.ownerUid || requestData.uid || requestUid);
  const email = normalizeEmailLower(requestData.email || requestData.emailLower);
  const companyName = normalizeString(requestData.companyName || requestData.name);
  const addressKey = normalizeString(requestData.addressKey || requestData.locationKey || "orly");
  const clientRef = db.doc(`clients/${ownerUid}`);
  
  const firstName = normalizeString(requestData.firstName);
  const lastName = normalizeString(requestData.lastName);
  const representative = normalizeString(requestData.representative) || `${firstName} ${lastName}`.trim();
  const displayName = representative || companyName || email;

  // 1. Provisionnement d'Authentification (Idempotent par nature dans ensureClientAccess)
  const authProvision = await ensureClientAccess({
    uid: ownerUid,
    email,
    displayName,
    companyName,
  });

  let passwordSetupLink: string | null = null;
  if (email && authProvision.provisioned) {
    try {
      passwordSetupLink = await buildPasswordSetupLink(email);
    } catch (linkError: any) {
      logger.warn("[performProvisioning] lien mdp non généré", { requestUid, message: linkError?.message });
    }
  }

  // 2. Email d'activation (Idempotence : ne pas renvoyer si déjà marqué envoyé)
  let activationEmailSent = requestData.activationEmailSent === true;
  let activationEmailSentAt = requestData.activationEmailSentAt || null;

  if (email && authProvision.provisioned && !activationEmailSent) {
    try {
      await queueEmail(
        email,
        "Votre dossier CCS-DOM a été validé ✅",
        buildHtml(
          "Votre dossier a été validé",
          `Bonjour, votre demande de domiciliation${companyName ? ` pour <strong>${companyName}</strong>` : ""} a bien été validée.<br/><br/>${
            passwordSetupLink
              ? "Pour activer votre accès client et définir votre mot de passe, cliquez sur le bouton ci-dessous."
              : "Votre accès client est prêt. Vous pouvez maintenant accéder à votre espace CCS-DOM."
          }`,
          passwordSetupLink ? "Définir mon mot de passe" : "Accéder à mon espace",
          passwordSetupLink || "https://ccsdom.fr/login"
        )
      );
      activationEmailSent = true;
      activationEmailSentAt = now;
    } catch (mailError: any) {
      logger.warn("[performProvisioning] email non envoyé", { requestUid, message: mailError?.message });
    }
  }

  // 3. Mise à jour atomique des champs de PROVISIONNEMENT uniquement
  const provisioningUpdate = {
    accessProvisioned: authProvision.provisioned,
    accessProvisionedAt: authProvision.provisioned ? now : null,
    accessProvisionedReason: authProvision.reason || null,
    activationEmailSent,
    activationEmailSentAt,
    updatedAt: now,
  };

  // Mise à jour multiple (Targeted updates pour ne pas écraser les données métier)
  const batch = db.batch();
  const clientSnap = await clientRef.get();
  
  // Update Request
  batch.set(requestRef, provisioningUpdate, { merge: true });

  // Restore the operational client mirror if it is missing, otherwise keep a narrow provisioning update.
  if (clientSnap.exists) {
    batch.set(clientRef, provisioningUpdate, { merge: true });
  } else {
    const clientPayload = mapRequestToClient(requestData, {}, {
      requestUid,
      ownerUid,
      actorUid,
      now,
      accessProvisioned: authProvision.provisioned,
      accessProvisionedAt: authProvision.provisioned ? now : null,
    });
    batch.set(clientRef, clientPayload, { merge: true });
  }

  // Update User & Customer metadata
  batch.set(db.doc(`users/${ownerUid}`), {
    uid: ownerUid,
    email,
    emailLower: email,
    displayName,
    firstName,
    lastName,
    role: "client",
    status: "active",
    clientId: ownerUid,
    addressKey,
    updatedAt: now,
  }, { merge: true });

  batch.set(db.doc(`customers/${ownerUid}`), {
    email,
    uid: ownerUid,
    updatedAt: now,
  }, { merge: true });

  await batch.commit();

  // Log d'activité
  const actorSnap = await db.doc(`users/${actorUid}`).get();
  const actorRole = normalizeString(actorSnap.data()?.role) || "staff";

  await db.collection("activity_logs").add({
    type: authProvision.provisioned ? "signup.provisioned" : "signup.provisioning_failed",
    actorUid,
    actorRole,
    clientId: ownerUid,
    requestUid,
    createdAt: now,
  });

  return {
    ok: true,
    authProvision,
    emailSent: activationEmailSent,
  };
}

export const approveSignup = onCall(
  { region: "europe-west9", cors: true },
  async (req) => {
    try {
      if (!req.auth?.uid) {
        throw new HttpsError("unauthenticated", "Authentification requise.");
      }

      const actorUid = req.auth.uid;
      const { role } = await requireStaff(actorUid);

      const requestUid = normalizeString(req.data?.requestUid || req.data?.uid);
      if (!requestUid) {
        throw new HttpsError("invalid-argument", "requestUid requis.");
      }

      const requestRef = db.doc(`client_requests/${requestUid}`);
      const requestSnap = await requestRef.get();
      if (!requestSnap.exists) {
        throw new HttpsError("not-found", "Demande introuvable.");
      }

      const requestData = requestSnap.data() || {};
      const ownerUid = normalizeString(requestData.ownerUid || requestData.uid || requestUid);
      const email = normalizeEmailLower(requestData.email || requestData.emailLower);
      const addressKey = normalizeString(requestData.addressKey || requestData.locationKey || "orly");
      const now = admin.firestore.FieldValue.serverTimestamp();

      // 1. Mise à jour du statut MÉTIER (Approbation)
      await requestRef.set(
        {
          status: SIGNUP_REQUEST_STATUS.APPROVED,
          approvedAt: now,
          approvedBy: actorUid,
          updatedAt: now,
          rejectedAt: admin.firestore.FieldValue.delete(),
          rejectedBy: admin.firestore.FieldValue.delete(),
          rejectionReason: admin.firestore.FieldValue.delete(),
        },
        { merge: true }
      );

      // 2. Initialisation du document Client (Mapping complet)
      const clientRef = db.doc(`clients/${ownerUid}`);
      const clientSnap = await clientRef.get();
      const currentClientData = clientSnap.data() || {};
      
      const clientPayload = mapRequestToClient(requestData, currentClientData, {
        requestUid,
        ownerUid,
        actorUid,
        now,
        accessProvisioned: false, // Sera mis à jour par performProvisioning
        accessProvisionedAt: null,
      });

      await clientRef.set(clientPayload, { merge: true });

      // 3. Déclenchement du Provisioning TECHNIQUE
      const provisionResult = await performProvisioning(requestUid, actorUid);

      // 4. Audit Final
      await db.collection("audit_logs").add({
        event: "signup_approved",
        ownerUid,
        actorUid,
        actorRole: role,
        requestUid,
        email,
        addressKey: addressKey || null,
        ts: now,
      });

      logger.info("[approveSignup] Dossier approuvé et provisionné", {
        requestUid,
        ownerUid,
        accessProvisioned: provisionResult.authProvision.provisioned,
      });

      return {
        ok: true,
        requestUid,
        uid: ownerUid,
        status: SIGNUP_REQUEST_STATUS.APPROVED,
        accessProvisioned: provisionResult.authProvision.provisioned,
        emailSent: provisionResult.emailSent,
      };
    } catch (error: any) {
      logger.error("[approveSignup] Erreur lors de l'approbation", {
        message: error?.message ?? String(error),
      });

      if (error instanceof HttpsError) throw error;
      throw new HttpsError("internal", "Erreur serveur approveSignup", error?.message);
    }
  }
);

/**
 * Action "Retry Provisioning" : Relance le provisionnement technique
 * sans réinitialiser l'approbation métier.
 */
export const retryProvisioning = onCall(
  { region: "europe-west9", cors: true },
  async (req) => {
    try {
      if (!req.auth?.uid) {
        throw new HttpsError("unauthenticated", "Authentification requise.");
      }

      const actorUid = req.auth.uid;
      await requireStaff(actorUid);

      const requestUid = normalizeString(req.data?.requestUid || req.data?.uid);
      if (!requestUid) {
        throw new HttpsError("invalid-argument", "requestUid requis.");
      }

      const requestRef = db.doc(`client_requests/${requestUid}`);
      const requestSnap = await requestRef.get();

      if (!requestSnap.exists) {
        throw new HttpsError("not-found", "Dossier introuvable.");
      }

      const requestData = requestSnap.data() || {};
      
      // Sécurité : On ne provisionne que si le dossier est déjà APPROUVÉ
      if (requestData.status !== SIGNUP_REQUEST_STATUS.APPROVED) {
        throw new HttpsError("failed-precondition", "Le dossier n'est pas dans un état approuvé.");
      }

      // Eviter les doubles appels inutiles si déjà OK
      if (requestData.accessProvisioned === true && requestData.activationEmailSent === true) {
        return { ok: true, message: "L'accès est déjà totalement provisionné.", status: "no_action" };
      }

      // Relance du provisionnement technique
      const result = await performProvisioning(requestUid, actorUid);

      return {
        ok: true,
        accessProvisioned: result.authProvision.provisioned,
        emailSent: result.emailSent,
      };

    } catch (error: any) {
      logger.error("[retryProvisioning] Erreur de relance", {
        message: error?.message ?? String(error),
      });
      if (error instanceof HttpsError) throw error;
      throw new HttpsError("internal", "Erreur retryProvisioning", error?.message);
    }
  }
);

export const rejectSignup = onCall(
  { region: "europe-west9", cors: true },
  async (req) => {
    try {
      if (!req.auth?.uid) {
        throw new HttpsError("unauthenticated", "Authentification requise.");
      }

      const actorUid = req.auth.uid;
      const { role } = await requireStaff(actorUid);

      const requestUid = normalizeString(req.data?.requestUid || req.data?.uid);
      const reason = normalizeString(
        req.data?.reason || req.data?.rejectionReason
      );

      if (!requestUid) {
        throw new HttpsError("invalid-argument", "requestUid requis.");
      }

      if (!reason) {
        throw new HttpsError(
          "invalid-argument",
          "Le motif de rejet est requis."
        );
      }

      const requestRef = db.doc(`client_requests/${requestUid}`);
      const requestSnap = await requestRef.get();

      if (!requestSnap.exists) {
        throw new HttpsError("not-found", "Demande introuvable.");
      }

      const requestData = requestSnap.data() || {};
      const ownerUid = normalizeString(
        requestData.ownerUid || requestData.uid || requestUid
      );
      const email = normalizeEmailLower(
        requestData.email || requestData.emailLower
      );
      const companyName = normalizeString(
        requestData.companyName || requestData.name
      );
      const addressKey = normalizeString(
        requestData.addressKey || requestData.locationKey || "orly"
      );
      const now = admin.firestore.FieldValue.serverTimestamp();

      await requestRef.set(
        {
          status: SIGNUP_REQUEST_STATUS.REJECTED,
          rejectedAt: now,
          rejectedBy: actorUid,
          rejectionReason: reason,
          approvedAt: admin.firestore.FieldValue.delete(),
          approvedBy: admin.firestore.FieldValue.delete(),
          updatedAt: now,
        },
        { merge: true }
      );

      const clientRef = db.doc(`clients/${ownerUid}`);
      const clientSnap = await clientRef.get();

      if (clientSnap.exists) {
        await clientRef.set(
          {
            status: CLIENT_STATUS.REFUSED,
            rejectedAt: now,
            rejectedBy: actorUid,
            rejectionReason: reason,
            updatedAt: now,
          },
          { merge: true }
        );
      }

      await db.collection("activity_logs").add({
        type: "signup.rejected",
        actorUid,
        actorRole: role,
        clientId: ownerUid,
        requestUid,
        centerKey: addressKey || null,
        reason,
        createdAt: now,
      });

      await db.collection("audit_logs").add({
        event: "signup_rejected",
        ownerUid,
        actorUid,
        actorRole: role,
        requestUid,
        email,
        addressKey: addressKey || null,
        reason,
        ts: now,
      });

      if (email) {
        try {
          await queueEmail(
            email,
            "Mise à jour de votre dossier CCS-DOM",
            buildHtml(
              "Votre dossier nécessite une correction",
              `Bonjour, votre demande de domiciliation${
                companyName ? ` pour <strong>${companyName}</strong>` : ""
              } n'a pas pu être validée en l'état.<br/><br/><strong>Motif :</strong> ${reason}<br/><br/>Vous pouvez reprendre contact avec notre équipe pour régulariser votre dossier.`
            )
          );
        } catch (mailError: any) {
          logger.warn("[rejectSignup] email client non envoyé", {
            requestUid,
            message: mailError?.message || String(mailError),
          });
        }
      }

      logger.info("[rejectSignup] OK", {
        requestUid,
        ownerUid,
        actorUid,
        actorRole: role,
      });

      return {
        ok: true,
        requestUid,
        uid: ownerUid,
        status: SIGNUP_REQUEST_STATUS.REJECTED,
      };
    } catch (error: any) {
      logger.error("[rejectSignup] ERROR", {
        message: error?.message ?? String(error),
        stack: error?.stack,
      });

      if (error instanceof HttpsError) throw error;

      throw new HttpsError(
        "internal",
        "Erreur serveur rejectSignup",
        error?.message ?? String(error)
      );
    }
  }
);
