// functions/src/notifications.ts

import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import {
  centerContactEmail,
  centerLabel,
  getStaffNotificationRecipients,
} from "./_utils/staff-notification-preferences";

if (!admin.apps.length) admin.initializeApp();

type AddressKey = string;

const db = admin.firestore();

function normalizeString(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function toAddressKey(value: unknown): AddressKey | null {
  const v = String(value ?? "").toLowerCase().trim();
  return v || null;
}

function isStaffRole(role: unknown) {
  const r = normalizeString(role);
  return [
    "admin",
    "superadmin",
    "manager",
    "manager_paris",
    "manager_orly",
    "secretary_paris",
    "secretary_orly",
  ].includes(r);
}

async function isStaff(uid: string) {
  const snap = await db.doc(`users/${uid}`).get();
  return isStaffRole(snap.data()?.role);
}

async function queueEmail(to: string | string[], subject: string, html: string) {
  const recipients = Array.isArray(to) ? to : [to];

  const mailRef = await db.collection("mails").add({
    to: recipients,
    message: { subject, html },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return mailRef.id;
}

function resolveAdminRecipient(addressKey: AddressKey) {
  return centerContactEmail(addressKey);
}

function buildHtml(
  title: string,
  body: string,
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
      <div style="font-size:14px">${body}</div>
      ${cta}
      <p style="margin-top:20px">— <strong>CCS-DOM</strong></p>
    </div>
  `;
}

function getNotificationKey(status: string) {
  switch (status) {
    case "draft":
    case "created":
      return "signupCreatedSent";
    case "docs_ready":
      return "docsReadySent";
    default:
      return `status_${status}`;
  }
}

export const sendSignupNotifications = onCall(
  { region: "europe-west9", cors: true },
  async (req) => {
    try {
      if (!req.auth?.uid) {
        throw new HttpsError("unauthenticated", "Authentification requise.");
      }

      const uid = req.auth.uid;
      const data = req.data || {};

      const requestUid = normalizeString(data.requestUid);
      const addressKey = toAddressKey(data.addressKey);
      const status = normalizeString(data.status || "draft");

      if (!requestUid) {
        throw new HttpsError("invalid-argument", "requestUid requis.");
      }

      if (!addressKey) {
        throw new HttpsError("invalid-argument", "addressKey invalide.");
      }

      const allowed = uid === requestUid || (await isStaff(uid));
      if (!allowed) {
        throw new HttpsError(
          "permission-denied",
          "Vous n'avez pas les droits pour envoyer cette notification."
        );
      }

      const requestRef = db.doc(`client_requests/${requestUid}`);
      const requestSnap = await requestRef.get();
      const requestData = requestSnap.exists ? requestSnap.data() || {} : {};
      const notificationKey = getNotificationKey(status);

      if (requestData?.notificationFlags?.[notificationKey] === true) {
        logger.info("[sendSignupNotifications] notification déjà envoyée", {
          requestUid,
          status,
          notificationKey,
        });

        return {
          ok: true,
          deduped: true,
          notificationKey,
        };
      }

      const companyName = normalizeString(
        data.companyName || requestData.companyName || requestData.name || "—"
      );

      const legalStatus = normalizeString(
        data.legalStatus || requestData.legalStatus || "—"
      );

      const fallbackContactName = normalizeString(
        `${requestData.firstName ?? ""} ${requestData.lastName ?? ""}`
      );

      const contactName = normalizeString(
        data.contactName ||
          requestData.representative ||
          fallbackContactName ||
          "—"
      );

      const contactEmail = normalizeEmail(
        data.contactEmail || requestData.email || requestData.emailLower || ""
      );

      const contactPhone = normalizeString(
        data.contactPhone || requestData.phone || "—"
      );

      const planName = normalizeString(
        data.planName || requestData.mailPlanId || "—"
      );

      const planPrice = normalizeString(data.planPrice || "");

      const docsRequiredCompleted = !!(
        data.docsRequiredCompleted ?? requestData.documentsRequiredCompleted
      );

      const createdAtStr = normalizeString(data.createdAtStr || "");
      const adminConsoleUrl = normalizeString(data.adminConsoleUrl || "");
      const clientIp = normalizeString(data.clientIp || "unknown");
      const userAgent = normalizeString(data.userAgent || "unknown");

      const staffNotificationLookup = await getStaffNotificationRecipients(
        addressKey,
        "notificationNewClient"
      );
      const adminTo =
        staffNotificationLookup.recipients.length > 0
          ? staffNotificationLookup.recipients.map((recipient) => recipient.email)
          : staffNotificationLookup.candidateCount === 0
            ? [resolveAdminRecipient(addressKey)]
            : [];
      const centerName = centerLabel(staffNotificationLookup.centerId || addressKey);

      let adminSubject = `Nouvelle demande de domiciliation – ${companyName}`;
      let adminHtml = buildHtml(
        "Nouvelle demande de domiciliation",
        `
          <p><strong>Société :</strong> ${companyName}</p>
          <p><strong>Contact :</strong> ${contactName}</p>
          <p><strong>Email :</strong> ${contactEmail || "—"}</p>
          <p><strong>Téléphone :</strong> ${contactPhone}</p>
          <p><strong>Statut juridique :</strong> ${legalStatus}</p>
          <p><strong>Centre :</strong> ${centerName}</p>
          <p><strong>Formule :</strong> ${planName}${planPrice ? ` – ${planPrice}` : ""}</p>
          <p><strong>Référence :</strong> ${requestUid}</p>
          ${createdAtStr ? `<p><strong>Créé le :</strong> ${createdAtStr}</p>` : ""}
          <p><strong>IP :</strong> ${clientIp}</p>
          <p><strong>User agent :</strong> ${userAgent}</p>
        `,
        adminConsoleUrl ? "Ouvrir le dossier" : undefined,
        adminConsoleUrl || undefined
      );

      let clientSubject = "Confirmation de votre demande – CCS-DOM";
      let clientHtml = buildHtml(
        "Votre demande a bien été reçue",
        `
          <p>Bonjour ${contactName || "—"},</p>
          <p>Nous confirmons la réception de votre demande pour <strong>${companyName}</strong>.</p>
          <p><strong>Centre :</strong> ${centerName}</p>
          <p><strong>Formule :</strong> ${planName}${planPrice ? ` – ${planPrice}` : ""}</p>
          <p><strong>Référence dossier :</strong> ${requestUid}</p>
        `,
        "Accéder à mon espace",
        "https://ccsdom.fr/login"
      );

      if (status === "docs_ready") {
        adminSubject = `Dossier complet – ${companyName}`;
        adminHtml = buildHtml(
          "Dossier prêt pour validation",
          `
            <p>Le dossier de <strong>${companyName}</strong> est maintenant complet.</p>
            <p><strong>Contact :</strong> ${contactName}</p>
            <p><strong>Email :</strong> ${contactEmail || "—"}</p>
            <p><strong>Téléphone :</strong> ${contactPhone}</p>
            <p><strong>Centre :</strong> ${centerName}</p>
            <p><strong>Documents requis complets :</strong> ${docsRequiredCompleted ? "Oui" : "Non"}</p>
            <p><strong>Référence :</strong> ${requestUid}</p>
          `,
          adminConsoleUrl ? "Ouvrir le dossier" : undefined,
          adminConsoleUrl || undefined
        );

        clientSubject = "Votre dossier est complet – CCS-DOM";
        clientHtml = buildHtml(
          "Votre dossier est prêt",
          `
            <p>Bonjour ${contactName || "—"},</p>
            <p>Nous avons bien reçu les documents requis pour <strong>${companyName}</strong>.</p>
            <p>Votre dossier va maintenant être vérifié par notre équipe.</p>
            <p><strong>Référence :</strong> ${requestUid}</p>
          `,
          "Accéder à mon espace",
          "https://ccsdom.fr/login"
        );
      }

      const centerIdForTrace = staffNotificationLookup.centerId || addressKey;
      let adminEmailQueueId: string | null = null;

      if (adminTo.length > 0) {
        adminEmailQueueId = await queueEmail(adminTo, adminSubject, adminHtml);
      } else {
        logger.info("[sendSignupNotifications] admin notification skipped by preferences", {
          requestUid,
          status,
          center: centerIdForTrace,
          preference: "notificationNewClient",
          candidateCount: staffNotificationLookup.candidateCount,
          recipientCount: staffNotificationLookup.recipients.length,
        });
      }

      await db.collection("activity_logs").add({
        type: adminEmailQueueId
          ? "signup.staff_notification_queued"
          : "signup.staff_notification_skipped",
        actorUid: "system",
        actorRole: "system",
        centerId: centerIdForTrace,
        requestUid,
        clientId: requestUid,
        status,
        preference: "notificationNewClient",
        recipientCount: adminTo.length,
        candidateCount: staffNotificationLookup.candidateCount,
        emailQueueId: adminEmailQueueId,
        reason: adminEmailQueueId ? "queued" : "disabled_by_preferences",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (contactEmail) {
        await queueEmail(contactEmail, clientSubject, clientHtml);
      }

      // ✅ ne plus écraser toute la map notificationFlags
      await requestRef.set(
        {
          [`notificationFlags.${notificationKey}`]: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      logger.info("[sendSignupNotifications] notifications envoyées", {
        requestUid,
        status,
        notificationKey,
        adminTo,
        adminRecipients: staffNotificationLookup.recipients.map((recipient) => recipient.uid),
        adminEmailQueueId,
        adminCandidateCount: staffNotificationLookup.candidateCount,
        clientTo: contactEmail || null,
      });

      return {
        ok: true,
        deduped: false,
        notificationKey,
      };
    } catch (error: any) {
      logger.error("[sendSignupNotifications] ERROR", {
        message: error?.message ?? String(error),
        stack: error?.stack,
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError(
        "internal",
        "Erreur serveur sendSignupNotifications",
        error?.message ?? String(error)
      );
    }
  }
);
