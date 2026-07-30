// functions/src/admin/bulk-update-clients.ts
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import { CLIENT_STATUS } from "../_config/signup-constants";
import {
  canManageClientsRole,
  canTouchCenter,
  getCallerAccess,
  normalizeCenterId,
  resolveCenterIdFromData,
  type CenterId,
} from "../_utils/auth";

if (!admin.apps.length) admin.initializeApp();

type ClientStatus = typeof CLIENT_STATUS[keyof typeof CLIENT_STATUS];

const VALID_STATUSES: ClientStatus[] = [
  CLIENT_STATUS.ACTIVE,
  CLIENT_STATUS.INACTIVE,
  CLIENT_STATUS.SUSPENDED,
  CLIENT_STATUS.PENDING,
];

/* =========================
   Helpers data
========================= */

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function normalizeStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const cleaned = input
    .map((v) => (typeof v === "string" ? v : String(v)))
    .map((s) => s.trim())
    .filter(Boolean);
  return Array.from(new Set(cleaned));
}

function normalizeStatus(input: unknown): ClientStatus {
  const s = (typeof input === "string" ? input.trim() : "") as ClientStatus;
  if (!VALID_STATUSES.includes(s)) {
    throw new HttpsError("invalid-argument", "Invalid status");
  }
  return s;
}

function safeErr(e: any) {
  return {
    code: String(e?.code ?? "unknown"),
    message: String(e?.message ?? "Unknown error"),
  };
}

/* =========================
   Types logs/results
========================= */

/**
 * IMPORTANT:
 * On garde EXACTEMENT les clés utilisées par le front (/admin/activity):
 * - results.requested
 * - results.updated
 * - results.missingCount
 * - (optionnel) results.missingSample, results.errorsSample
 */
type BulkUpdateResults = {
  requested: number;
  updated: number;
  missingCount: number;
  missingSample?: string[];
  errorsSample?: Array<{ clientId: string; code: string; message: string }>;
};

/* =========================
   Callable
========================= */

/**
 * Callable: adminBulkUpdateClientsStatus
 * payload: {
 *   clientIds: string[],
 *   status: ClientStatus,
 *   centerId?: "paris_12e" | "orly_ville", // recommandé pour super_admin
 *   perClientLogs?: boolean               // optionnel (audit fin)
 * }
 */
export const adminBulkUpdateClientsStatus = onCall(
  { region: "europe-west9" },
  async (req) => {
    const caller = await getCallerAccess(req);
    const actorUid = caller.uid;
    const role = caller.role;

    if (!canManageClientsRole(role)) {
      throw new HttpsError("permission-denied", "Insufficient permissions");
    }

    const clientIds = normalizeStringArray(req.data?.clientIds);
    const status = normalizeStatus(req.data?.status);

    if (clientIds.length === 0) {
      throw new HttpsError("invalid-argument", "clientIds required");
    }

    // garde-fou volume
    if (clientIds.length > 300) {
      throw new HttpsError("failed-precondition", "Too many clients in one operation (max 300)");
    }

    // centre demandé (utile surtout pour super_admin)
    const requestedCenterId = normalizeCenterId(req.data?.centerId);

    // si manager => centre imposé
    const effectiveCenterId: CenterId | null =
      role === "super_admin" ? requestedCenterId : requestedCenterId ?? caller.managedCenterIds[0] ?? null;

    // manager ne doit jamais agir hors de son centre
    if (!canTouchCenter(role, caller.managedCenterIds, effectiveCenterId)) {
      throw new HttpsError("permission-denied", "You cannot manage this center");
    }

    const perClientLogs = Boolean(req.data?.perClientLogs);

    const db = admin.firestore();
    const now = admin.firestore.FieldValue.serverTimestamp();

    // ✅ log bulk unique
    const bulkLogRef = db.collection("activity_logs").doc();

    await bulkLogRef.set({
      type: "client.bulk_status_update",
      createdAt: now,

      actorUid,
      actorRole: role,

      centerId: effectiveCenterId, // <- IMPORTANT pour le filtre manager_orly / manager_paris
      targetCount: clientIds.length,
      targetIdsSample: clientIds.slice(0, 10),

      // on garde ce champ pour affichage direct côté front
      toStatus: status,

      // résultat initial (sera update à la fin)
      results: {
        requested: clientIds.length,
        updated: 0,
        missingCount: 0,
        missingSample: [],
        errorsSample: [],
      } satisfies BulkUpdateResults,
    });

    const missing: string[] = [];
    const errorsSample: BulkUpdateResults["errorsSample"] = [];
    let updated = 0;

    // batch max 500 ops
    // - update client (1)
    // - optionnel log par client (1)
    // => 200 clients -> 400 ops safe
    const groups = chunk(clientIds, 200);

    try {
      for (const group of groups) {
        const snaps = await Promise.all(
          group.map((id) => db.collection("clients").doc(id).get())
        );

        const batch = db.batch();

        for (let i = 0; i < group.length; i++) {
          const clientId = group[i];
          const snap = snaps[i];

          if (!snap.exists) {
            missing.push(clientId);
            continue;
          }

          const clientCenter = resolveCenterIdFromData(snap.data() || {});
          if (role !== "super_admin" && clientCenter && !canTouchCenter(role, caller.managedCenterIds, clientCenter)) {
            if (errorsSample && errorsSample.length < 5) {
              errorsSample.push({
                clientId,
                code: "center-mismatch",
                message: "Client is not in your center",
              });
            }
            continue;
          }

          const ref = db.collection("clients").doc(clientId);

          batch.update(ref, {
            status,
            updatedAt: now,
          });

          if (perClientLogs) {
            const logRef = db.collection("activity_logs").doc();
            batch.set(logRef, {
              type: "client.status_update",
              actorUid,
              actorRole: role,
              centerId: effectiveCenterId,
              clientId,
              toStatus: status,
              createdAt: now,
              bulkId: bulkLogRef.id,
            });
          }

          updated++;
        }

        await batch.commit();
      }
    } catch (e: any) {
      const se = safeErr(e);
      if (errorsSample && errorsSample.length < 5) {
        errorsSample.push({
          clientId: "—",
          code: se.code,
          message: se.message,
        });
      }
    } finally {
      const results: BulkUpdateResults = {
        requested: clientIds.length,
        updated,
        missingCount: missing.length,
        missingSample: missing.slice(0, 10),
        errorsSample: errorsSample?.slice(0, 5) ?? [],
      };

      await bulkLogRef.update({
        results,
        updatedAt: now,
      });
    }

    return {
      ok: true,
      updated,
      missingCount: missing.length,
      missing,
      bulkLogId: bulkLogRef.id,
    };
  }
);
