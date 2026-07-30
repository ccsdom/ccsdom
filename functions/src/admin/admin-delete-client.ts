// functions/src/admin/admin-delete-client.ts
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {
  canManageClientsRole,
  canTouchCenter,
  getCallerAccess,
  resolveCenterIdFromData,
  type CenterId,
} from "../_utils/auth";
import { isAdminClientRequestMirror } from "../_utils/admin-client-request-mirror";

if (!admin.apps.length) admin.initializeApp();

function normalizeClientId(input: unknown): string {
  const id = typeof input === "string" ? input.trim() : "";
  if (!id) throw new HttpsError("invalid-argument", "clientId required");
  return id;
}

export const adminDeleteClient = onCall({ region: "europe-west9" }, async (req) => {
  const caller = await getCallerAccess(req);
  const actorUid = caller.uid;
  const role = caller.role;

  if (!canManageClientsRole(role)) throw new HttpsError("permission-denied", "Insufficient permissions");

  const clientId = normalizeClientId(req.data?.clientId);

  const db = admin.firestore();

  // 1) lire client
  const clientRef = db.collection("clients").doc(clientId);
  const snap = await clientRef.get();
  if (!snap.exists) throw new HttpsError("not-found", "Client not found");

  const clientData = snap.data() || {};
  const clientUid = typeof clientData?.uid === "string" ? clientData.uid.trim() : "";
  const requestRef = db.collection("client_requests").doc(clientId);
  const requestSnap = await requestRef.get();
  const requestData = requestSnap.data() || {};

  // 2) centre effectif
  const clientCenter = resolveCenterIdFromData(clientData);
  const effectiveCenter: CenterId | null =
    role === "super_admin" ? clientCenter : clientCenter ?? caller.managedCenterIds[0] ?? null;

  if (!canTouchCenter(role, caller.managedCenterIds, effectiveCenter)) {
    throw new HttpsError("permission-denied", "You cannot manage this center");
  }
  if (role !== "super_admin" && clientCenter && !canTouchCenter(role, caller.managedCenterIds, clientCenter)) {
    throw new HttpsError("permission-denied", "Client is not in your center");
  }

  // 3) supprimer docs firestore en batch
  const batch = db.batch();
  batch.delete(clientRef);
  if (requestSnap.exists && isAdminClientRequestMirror(requestData, clientData)) {
    batch.delete(requestRef);
  }

  if (clientUid) {
    batch.delete(db.collection("users").doc(clientUid));
  }

  // 4) log unitaire
  const centerId = effectiveCenter ?? clientCenter ?? null;
  const logRef = db.collection("activity_logs").doc();
  batch.set(logRef, {
    type: "client.delete",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    actorUid,
    actorRole: role,
    centerId,
    clientId,
    clientUid: clientUid || null,
  });

  await batch.commit();

  // 5) suppression Auth hors batch
  if (clientUid) {
    try {
      await admin.auth().deleteUser(clientUid);
    } catch (e: any) {
      // on ne fail pas : Firestore est déjà clean
      try {
        await db.collection("activity_logs").add({
          type: "client.delete.auth_error",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          actorUid,
          actorRole: role,
          centerId,
          clientId,
          clientUid,
          error: String(e?.message ?? e),
        });
      } catch {
        /* no-op */
      }
    }
  }

  return { ok: true, clientId, clientUid: clientUid || null, centerId };
});
