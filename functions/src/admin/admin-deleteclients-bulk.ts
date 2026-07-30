// functions/src/admin/admin-deleteclients-bulk.ts
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {
  canManageClientsRole,
  canTouchCenter,
  getCallerAccess,
  normalizeCenterId,
  resolveCenterIdFromData,
  type CenterId,
} from "../_utils/auth";
import { isAdminClientRequestMirror } from "../_utils/admin-client-request-mirror";

if (!admin.apps.length) admin.initializeApp();

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Convertit unknown -> string[] propre & safe + dédup */
function normalizeStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const cleaned = input
    .map((v) => (typeof v === "string" ? v : String(v)))
    .map((s) => s.trim())
    .filter(Boolean);
  return Array.from(new Set(cleaned));
}

function safeErr(e: any) {
  return {
    code: String(e?.code ?? "unknown"),
    message: String(e?.message ?? "Unknown error"),
  };
}

type AuthDeleteError = { clientId: string; uid: string; error: string };
type BulkDeleteResults = {
  requested: number;

  deletedClients: number; // Firestore clients docs deleted
  deletedRequestDocs: number; // Firestore client_requests docs deleted
  deletedUserDocs: number; // Firestore users docs deleted
  deletedAuthUsers: number; // Auth users deleted

  missingClientsCount: number;
  missingAuthUidCount: number;

  authDeleteErrorsCount: number;

  // samples (audit lisible)
  missingClientsSample: string[];
  missingAuthUidSample: string[];
  authDeleteErrorsSample: AuthDeleteError[];
  errorsSample: Array<{ clientId: string; code: string; message: string }>;
};

/**
 * Callable: adminDeleteClientsBulk
 * payload: { clientIds: string[], centerId?: "paris_12e" | "orly_ville", perClientLogs?: boolean }
 *
 * Effets:
 * - supprime clients/{clientId}
 * - supprime users/{clientUid} si uid présent
 * - supprime l'utilisateur Auth (admin.auth().deleteUser(uid)) si uid présent
 * - journalise en 1 log bulk + (optionnel) logs unitaires
 */
export const adminDeleteClientsBulk = onCall(
  { region: "europe-west9" },
  async (req) => {
    const caller = await getCallerAccess(req);
    const actorUid = caller.uid;
    const role = caller.role;

    if (!canManageClientsRole(role)) {
      throw new HttpsError("permission-denied", "Insufficient permissions");
    }

    const clientIds = normalizeStringArray(req.data?.clientIds);

    if (clientIds.length === 0) {
      throw new HttpsError("invalid-argument", "clientIds required");
    }

    // Garde-fou volume
    if (clientIds.length > 300) {
      throw new HttpsError(
        "failed-precondition",
        "Too many clients in one operation (max 300)"
      );
    }

    const centerId = normalizeCenterId(req.data?.centerId);

    const effectiveCenterId: CenterId | null =
      role === "super_admin" ? centerId : centerId ?? caller.managedCenterIds[0] ?? null;

    if (!canTouchCenter(role, caller.managedCenterIds, effectiveCenterId)) {
      throw new HttpsError("permission-denied", "You cannot manage this center");
    }

    const perClientLogs = Boolean(req.data?.perClientLogs);

    const db = admin.firestore();
    const now = admin.firestore.FieldValue.serverTimestamp();

    // ✅ Log BULK unique (1 doc)
    const bulkLogRef = db.collection("activity_logs").doc();
    await bulkLogRef.set({
      type: "client.bulk_delete",
      createdAt: now,

      actorUid,
      actorRole: role,

      centerId: effectiveCenterId,
      targetCount: clientIds.length,
      targetIdsSample: clientIds.slice(0, 10),

      results: {
        requested: clientIds.length,
        deletedClients: 0,
        deletedRequestDocs: 0,
        deletedUserDocs: 0,
        deletedAuthUsers: 0,
        missingClientsCount: 0,
        missingAuthUidCount: 0,
        authDeleteErrorsCount: 0,
        missingClientsSample: [],
        missingAuthUidSample: [],
        authDeleteErrorsSample: [],
        errorsSample: [],
      } as BulkDeleteResults,
    });

    // Résultats
    let deletedClients = 0;
    let deletedRequestDocs = 0;
    let deletedUserDocs = 0;
    let deletedAuthUsers = 0;

    const missingClients: string[] = [];
    const missingAuthUid: string[] = [];
    const authDeleteErrors: AuthDeleteError[] = [];
    const errorsSample: BulkDeleteResults["errorsSample"] = [];

    // Pour éviter dépassement des 500 ops batch :
    // par client => delete clients doc (1) + (optionnel) delete client_requests doc (1)
    // + (optionnel) delete users doc (1) + (optionnel) per-client log (1)
    // => jusqu'à 4 ops / client, donc on reste volontairement sous 500
    const groups = chunk(clientIds, 120);

    try {
      for (const group of groups) {
        // 1) on lit les clients en parallèle
        const snaps = await Promise.all(
          group.map((clientId) => db.collection("clients").doc(clientId).get())
        );
        const requestSnaps = await Promise.all(
          group.map((clientId) => db.collection("client_requests").doc(clientId).get())
        );

        // 2) batch Firestore (clients + users + logs unitaires optionnels)
        const batch = db.batch();

        // 3) suppressions Auth à faire hors batch
        const authUidsToDelete: { clientId: string; uid: string }[] = [];

        // Compteurs de ce groupe (on incrémente seulement si commit OK)
        let groupDeletedClients = 0;
        let groupDeletedRequestDocs = 0;
        let groupDeletedUserDocs = 0;

        for (let i = 0; i < group.length; i++) {
          const clientId = group[i];
          const snap = snaps[i];
          const requestSnap = requestSnaps[i];

          if (!snap.exists) {
            missingClients.push(clientId);
            continue;
          }

          const data = snap.data() || {};

          // 🔒 Vérif centre (si effectiveCenterId défini)
          const clientCenter = resolveCenterIdFromData(data);

          if (clientCenter && effectiveCenterId && clientCenter !== effectiveCenterId) {
            if (errorsSample.length < 5) {
              errorsSample.push({
                clientId,
                code: "center-mismatch",
                message: "Client is not in the selected center",
              });
            }
            continue;
          }

          if (
            role !== "super_admin" &&
            clientCenter &&
            !canTouchCenter(role, caller.managedCenterIds, clientCenter)
          ) {
            if (errorsSample.length < 5) {
              errorsSample.push({
                clientId,
                code: "center-mismatch",
                message: "Client is outside your managed centers",
              });
            }
            continue;
          }

          const clientUid = typeof (data as any).uid === "string" ? String((data as any).uid).trim() : "";

          // delete client doc
          batch.delete(db.collection("clients").doc(clientId));
          groupDeletedClients++;
          if (requestSnap.exists && isAdminClientRequestMirror(requestSnap.data() || {}, data)) {
            batch.delete(db.collection("client_requests").doc(clientId));
            groupDeletedRequestDocs++;
          }

          // delete user profile doc (si uid connu)
          if (clientUid) {
            batch.delete(db.collection("users").doc(clientUid));
            groupDeletedUserDocs++;
            authUidsToDelete.push({ clientId, uid: clientUid });
          } else {
            missingAuthUid.push(clientId);
          }

          // logs unitaires optionnels
          if (perClientLogs) {
            const logRef = db.collection("activity_logs").doc();
            batch.set(logRef, {
              type: "client.delete",
              actorUid,
              actorRole: role,
              centerId: effectiveCenterId,
              clientId,
              clientUid: clientUid || null,
              createdAt: now,
              bulkId: bulkLogRef.id,
            });
          }
        }

        // commit Firestore
        await batch.commit();

        // commit OK => on incrémente les compteurs globaux
        deletedClients += groupDeletedClients;
        deletedRequestDocs += groupDeletedRequestDocs;
        deletedUserDocs += groupDeletedUserDocs;

        // 4) suppression Auth (séquentiel simple, stable)
        for (const item of authUidsToDelete) {
          try {
            await admin.auth().deleteUser(item.uid);
            deletedAuthUsers++;
          } catch (e: any) {
            authDeleteErrors.push({
              clientId: item.clientId,
              uid: item.uid,
              error: e?.message ?? String(e),
            });
          }
        }
      }
    } catch (e: any) {
      const se = safeErr(e);
      if (errorsSample.length < 5) {
        errorsSample.push({ clientId: "—", code: se.code, message: se.message });
      }
    } finally {
      const results: BulkDeleteResults = {
        requested: clientIds.length,

        deletedClients,
        deletedRequestDocs,
        deletedUserDocs,
        deletedAuthUsers,

        missingClientsCount: missingClients.length,
        missingAuthUidCount: missingAuthUid.length,

        authDeleteErrorsCount: authDeleteErrors.length,

        missingClientsSample: missingClients.slice(0, 10),
        missingAuthUidSample: missingAuthUid.slice(0, 10),
        authDeleteErrorsSample: authDeleteErrors.slice(0, 5),
        errorsSample,
      };

      await bulkLogRef.update({
        results,
        updatedAt: now,
      });
    }

    return {
      ok: true,
      requested: clientIds.length,
      deletedClients,
      deletedRequestDocs,
      deletedUserDocs,
      deletedAuthUsers,

      missingClientsCount: missingClients.length,
      missingClients,

      missingAuthUidCount: missingAuthUid.length,
      missingAuthUid,

      authDeleteErrorsCount: authDeleteErrors.length,
      authDeleteErrors,

      bulkLogId: bulkLogRef.id,
    };
  }
);
