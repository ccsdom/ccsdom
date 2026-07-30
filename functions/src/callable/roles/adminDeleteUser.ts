/* ==========================================================================
 * callable/roles/adminDeleteUser.ts — suppression sécurisée user (Auth + Firestore)
 * ========================================================================== */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import {
  canTouchCenter,
  getCallerAccess,
  managedCenterIdsFromData,
  type CenterId,
  type UserRole,
} from "../../_utils/auth";

async function assertAdminCaller(request: any) {
  const caller = await getCallerAccess(request);
  const allowed = new Set<UserRole>(["super_admin", "manager", "manager_paris", "manager_orly"]);

  if (!caller.role || !allowed.has(caller.role)) {
    throw new HttpsError("permission-denied", "Droits insuffisants");
  }

  return caller as { uid: string; role: UserRole; managedCenterIds: CenterId[] };
}

function isSecretaryRole(role: string): role is "secretary_paris" | "secretary_orly" {
  return role === "secretary_paris" || role === "secretary_orly";
}

function assertDeleteAllowed(
  caller: { uid: string; role: UserRole; managedCenterIds: CenterId[] },
  targetUid: string,
  targetData: Record<string, any>
) {
  const targetRole = String(targetData.role || "") as UserRole;

  if (caller.uid === targetUid) {
    throw new HttpsError("failed-precondition", "Impossible de supprimer son propre compte");
  }

  if (targetRole === "super_admin") {
    throw new HttpsError("failed-precondition", "Impossible de supprimer un super_admin");
  }

  if (caller.role === "super_admin") return;

  if (!isSecretaryRole(targetRole)) {
    throw new HttpsError("permission-denied", "Un manager peut uniquement revoquer un secretaire de son centre");
  }

  const targetCenterIds = managedCenterIdsFromData(targetRole, targetData);
  const canManageTarget = targetCenterIds.some((centerId) =>
    canTouchCenter(caller.role, caller.managedCenterIds, centerId)
  );

  if (!canManageTarget) {
    throw new HttpsError("permission-denied", "Centre non autorise pour cette revocation");
  }
}

/**
 * Supprime un utilisateur côté Firestore + Auth (si uid dispo).
 * - Interdit de supprimer un super_admin
 * - Reserve: super_admin + managers sur leurs secretaires de centre
 */
export const adminDeleteUser = onCall({ region: "europe-west9", cors: true }, async (request) => {
  const caller = await assertAdminCaller(request);

  const userId = String(request.data?.userId || "").trim();
  if (!userId) throw new HttpsError("invalid-argument", "userId requis");

  const db = admin.firestore();
  const ref = db.collection("users").doc(userId);
  const snap = await ref.get();

  if (!snap.exists) return { ok: true, deleted: false };

  const data = snap.data() || {};
  const targetUid = String((data as any).uid || userId || "").trim();

  assertDeleteAllowed(caller, targetUid, data);

  await ref.delete();

  if (targetUid) {
    try {
      await admin.auth().deleteUser(targetUid);
    } catch (e: any) {
      logger.warn("[adminDeleteUser] deleteUser(auth) failed:", e?.message || e);
    }
  }

  return { ok: true, deleted: true };
});
