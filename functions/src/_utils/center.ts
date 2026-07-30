// functions/src/_utils/center.ts
import { HttpsError } from "firebase-functions/v2/https";
import type { firestore } from "firebase-admin"; // <-- import de types via namespace

export type CenterId = "paris_12e" | "orly_ville";

export function resolveCenterId(data: any): CenterId | null {
  const c = (data?.centerId ?? data?.addressId ?? null) as string | null;
  if (c === "paris_12e" || c === "orly_ville") return c;
  return null;
}

/**
 * Garantit un centre canonique.
 * - accepte centerId
 * - fallback addressId (legacy)
 * - backfill centerId si legacy
 * - sinon => HttpsError failed-precondition
 *
 * Utilise les types : firestore.Transaction, firestore.DocumentReference
 */
export async function ensureCenterIdTx(
  tx: firestore.Transaction,
  requestRef: firestore.DocumentReference,
  data: any
): Promise<{ centerId: CenterId; backfilled: boolean }> {
  const centerId = resolveCenterId(data);
  if (!centerId) {
    throw new HttpsError("failed-precondition", "CENTER_MISSING", {
      reason: "Aucun centre détectable (centerId/addressId).",
      requestUid: requestRef.id,
    });
  }

  const needsBackfill = !data?.centerId && !!data?.addressId;
  if (needsBackfill) {
    tx.update(requestRef, {
      centerId,
      centerMissing: false,
      centerBackfilledAt: new Date(),
    });
  } else if (data?.centerMissing === true) {
    // si flag centreMissing traîne alors que le centre est résolu
    tx.update(requestRef, { centerMissing: false });
  }

  return { centerId, backfilled: needsBackfill };
}