// functions/src/rejectSignup.ts
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { SIGNUP_REQUEST_STATUS } from "./_config/signup-constants";
import { adminDb } from "./_utils/admin";
import { ensureCenterIdTx } from "./_utils/center";
import { requireAuth, requireRole } from "./_utils/auth";

export const rejectSignup = onCall({ region: "europe-west9" }, async (req) => {
  requireAuth(req);
  requireRole(req, ["super_admin", "manager_paris", "manager_orly", "secretary_paris", "secretary_orly"]);

  const requestUid = String(req.data?.requestUid || "").trim();
  const reason = String(req.data?.reason || "Dossier incomplet").trim();

  if (!requestUid) throw new HttpsError("invalid-argument", "requestUid manquant.");

  const requestRef = adminDb.collection("client_requests").doc(requestUid);

  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(requestRef);
    if (!snap.exists) throw new HttpsError("not-found", "Dossier introuvable.");

    const data = snap.data() || {};

    // ✅ verrou centre (canonique) + backfill legacy en TX
    const { centerId } = await ensureCenterIdTx(tx, requestRef, data);

    tx.update(requestRef, {
      status: SIGNUP_REQUEST_STATUS.REJECTED,
      rejectedAt: FieldValue.serverTimestamp(),
      rejectedBy: req.auth?.uid ?? null,
      rejectedReason: reason,
      centerId,
    });

    tx.set(adminDb.collection("audit_logs").doc(), {
      type: "signup_validation",
      action: SIGNUP_REQUEST_STATUS.REJECTED,
      requestUid,
      reason,
      centerId,
      performedBy: req.auth?.uid ?? null,
      performedAt: FieldValue.serverTimestamp(),
    });

    return { ok: true, requestUid, centerId };
  });
});