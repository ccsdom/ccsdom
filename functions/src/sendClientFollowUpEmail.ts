import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

import {
  canTouchCenter,
  getCallerAccess,
  resolveCenterIdFromData,
} from "./_utils/auth";

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

const STAFF_ROLES = new Set([
  "super_admin",
  "manager",
  "manager_paris",
  "manager_orly",
  "secretary_paris",
  "secretary_orly",
]);

function normalizeString(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

function normalizeEmail(input: unknown): string {
  return normalizeString(input).toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function textToHtml(message: string) {
  return escapeHtml(message)
    .split(/\r?\n/)
    .map((line) => (line ? `<p style="margin:0 0 12px">${line}</p>` : `<div style="height:8px"></div>`))
    .join("");
}

function buildEmailHtml(message: string) {
  return `
    <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.55;color:#111827">
      ${textToHtml(message)}
    </div>
  `;
}

function resolveClientEmail(data: Record<string, unknown>) {
  return normalizeEmail(data.emailLower || data.email);
}

export const sendClientFollowUpEmail = onCall({ region: "europe-west9", cors: true }, async (req) => {
  const caller = await getCallerAccess(req);

  if (!caller.role || !STAFF_ROLES.has(caller.role)) {
    throw new HttpsError("permission-denied", "Droits insuffisants pour envoyer une relance.");
  }

  const requestUid = normalizeString(req.data?.requestUid);
  const message = normalizeString(req.data?.message);
  const subject = normalizeString(req.data?.subject) || "Votre dossier CCS DOM nécessite une action";

  if (!requestUid) {
    throw new HttpsError("invalid-argument", "requestUid requis.");
  }

  if (message.length < 20 || message.length > 5000) {
    throw new HttpsError("invalid-argument", "Le message de relance est invalide.");
  }

  const requestRef = db.collection("client_requests").doc(requestUid);
  const requestSnap = await requestRef.get();

  if (!requestSnap.exists) {
    throw new HttpsError("not-found", "Dossier introuvable.");
  }

  const requestData = requestSnap.data() || {};
  const centerId = resolveCenterIdFromData(requestData);

  if (!canTouchCenter(caller.role, caller.managedCenterIds, centerId)) {
    throw new HttpsError("permission-denied", "Centre non autorisé pour cette relance.");
  }

  const email = resolveClientEmail(requestData);
  if (!email || !isValidEmail(email)) {
    throw new HttpsError("failed-precondition", "Le dossier client ne contient pas d'email valide.");
  }

  const now = admin.firestore.FieldValue.serverTimestamp();
  const preparedAt = admin.firestore.Timestamp.now();
  const existingFollowUp = (requestData.followUp || {}) as Record<string, any>;
  const existingHistory = Array.isArray(existingFollowUp.history) ? existingFollowUp.history : [];
  const historyEntry = {
    preparedAt,
    sentAt: preparedAt,
    preparedBy: caller.uid,
    role: caller.role,
    status: "sent",
    reason: normalizeString(req.data?.reason) || normalizeString(existingFollowUp.lastReason) || "Relance client",
    subject,
    message,
    to: email,
  };
  const nextHistory = [historyEntry, ...existingHistory].slice(0, 10);

  const mailRef = db.collection("mails").doc();
  const activityRef = db.collection("activity_logs").doc();
  const batch = db.batch();

  batch.set(mailRef, {
    to: [email],
    message: {
      subject,
      html: buildEmailHtml(message),
      text: message,
    },
    createdAt: now,
    source: "client_follow_up",
    requestUid,
    centerId,
    queuedBy: caller.uid,
  });

  batch.set(requestRef, {
    followUp: {
      ...existingFollowUp,
      lastPreparedAt: preparedAt,
      lastPreparedBy: caller.uid,
      lastPreparedByRole: caller.role,
      lastMessage: message,
      lastReason: historyEntry.reason,
      lastStatus: "sent",
      lastSentAt: preparedAt,
      lastSentBy: caller.uid,
      lastEmailTo: email,
      preparedCount: (Number(existingFollowUp.preparedCount) || 0) + 1,
      sentCount: (Number(existingFollowUp.sentCount) || 0) + 1,
      history: nextHistory,
    },
    updatedAt: now,
  }, { merge: true });

  batch.set(activityRef, {
    type: "client.follow_up_sent",
    createdAt: now,
    actorUid: caller.uid,
    actorRole: caller.role,
    requestUid,
    clientId: normalizeString(requestData.ownerUid || requestData.uid || requestUid),
    centerId,
    to: email,
    subject,
    reason: historyEntry.reason,
  });

  await batch.commit();

  logger.info("[sendClientFollowUpEmail] Follow-up email queued", {
    requestUid,
    centerId,
    actorUid: caller.uid,
    to: email,
  });

  return {
    ok: true,
    requestUid,
    to: email,
    status: "sent",
  };
});
