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

export const prepareClientFollowUp = onCall({ region: "europe-west9", cors: true }, async (req) => {
  const caller = await getCallerAccess(req);

  if (!caller.role || !STAFF_ROLES.has(caller.role)) {
    throw new HttpsError("permission-denied", "Droits insuffisants pour preparer une relance.");
  }

  const requestUid = normalizeString(req.data?.requestUid);
  const message = normalizeString(req.data?.message);
  const reason = normalizeString(req.data?.reason) || "Relance client";

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
    throw new HttpsError("permission-denied", "Centre non autorise pour cette relance.");
  }

  const now = admin.firestore.FieldValue.serverTimestamp();
  const preparedAt = admin.firestore.Timestamp.now();
  const existingFollowUp = (requestData.followUp || {}) as Record<string, any>;
  const existingHistory = Array.isArray(existingFollowUp.history) ? existingFollowUp.history : [];
  const historyEntry = {
    preparedAt,
    preparedBy: caller.uid,
    role: caller.role,
    status: "prepared",
    requestStatus: normalizeString(requestData.status) || null,
    reason,
    message,
  };
  const nextHistory = [historyEntry, ...existingHistory].slice(0, 10);

  const activityRef = db.collection("activity_logs").doc();
  const batch = db.batch();

  batch.set(requestRef, {
    followUp: {
      ...existingFollowUp,
      lastPreparedAt: preparedAt,
      lastPreparedBy: caller.uid,
      lastPreparedByRole: caller.role,
      lastMessage: message,
      lastReason: reason,
      lastStatus: "prepared",
      preparedCount: (Number(existingFollowUp.preparedCount) || 0) + 1,
      history: nextHistory,
    },
    updatedAt: now,
  }, { merge: true });

  batch.set(activityRef, {
    type: "client.follow_up_prepared",
    createdAt: now,
    actorUid: caller.uid,
    actorRole: caller.role,
    requestUid,
    clientId: normalizeString(requestData.ownerUid || requestData.uid || requestUid),
    centerId,
    reason,
  });

  await batch.commit();

  logger.info("[prepareClientFollowUp] Follow-up prepared", {
    requestUid,
    centerId,
    actorUid: caller.uid,
    reason,
  });

  return {
    ok: true,
    requestUid,
    status: "prepared",
  };
});
