/* scripts/backfill-client-requests-center.ts
 *
 * ✅ Objectif:
 * - Normaliser le “centre” d’un dossier client_requests pour pouvoir filtrer côté managers (Paris/Orly)
 * - Écrire des champs canoniques + compat legacy
 *
 * ✅ Champs écrits (merge):
 * - centerId: "paris_12e" | "orly_ville"   (CANONIQUE ✅)
 * - centerKey: "paris" | "orly"           (CANONIQUE ✅)
 * - addressId/addressKey/locationKey      (LEGACY compat)
 * - __backfillCenter                      (audit)
 *
 * ✅ Options:
 * --dry-run      : ne commit rien, affiche les stats
 * --only-missing : ne patch que si centerId absent/invalide
 * --page-size=500
 *
 * ✅ Exemples:
 *   cd functions
 *   env -u GOOGLE_APPLICATION_CREDENTIALS npx ts-node ./scripts/backfill-client-requests-center.ts --dry-run
 *   env -u GOOGLE_APPLICATION_CREDENTIALS npx ts-node ./scripts/backfill-client-requests-center.ts --only-missing
 */

import * as admin from "firebase-admin";

if (!admin.apps.length) {
  // ✅ utilise ADC (Application Default Credentials) si dispo
  admin.initializeApp();
}

type AddressId = "paris_12e" | "orly_ville";
type AddressKey = "paris" | "orly";

/* ------------------------- Utils ------------------------- */

function toLowerSafe(v: any) {
  return String(v ?? "").toLowerCase().trim();
}

function toAddressKey(v: any): AddressKey | null {
  const s = toLowerSafe(v);
  if (s === "paris" || s === "orly") return s as AddressKey;
  return null;
}

function isAddressId(v: any): v is AddressId {
  return v === "paris_12e" || v === "orly_ville";
}

function addressIdToKey(id: AddressId): AddressKey {
  return id === "orly_ville" ? "orly" : "paris";
}

/**
 * Déduit le centre depuis un doc client_requests
 * Priorités:
 * - centerId (canonique) / finalAddressId / domiciliationAddressId / addressId
 * - centerKey (canonique) / addressKey / locationKey / addressId (si legacy "paris"/"orly")
 */
function inferCenterIdFromDoc(d: any): AddressId | null {
  const direct = [
    d?.centerId,
    d?.finalAddressId,
    d?.domiciliationAddressId,
    d?.addressId,
  ]
    .map((x: any) => String(x ?? "").trim())
    .filter(Boolean);

  for (const v of direct) {
    if (isAddressId(v)) return v;
  }

  const key = toAddressKey(d?.centerKey || d?.addressKey || d?.locationKey || d?.addressId);
  if (key === "paris") return "paris_12e";
  if (key === "orly") return "orly_ville";
  return null;
}

/* ------------------------- CLI args ------------------------- */

function hasArg(name: string) {
  return process.argv.includes(name);
}

function getArgValue(prefix: string): string | null {
  const arg = process.argv.find((a) => a.startsWith(prefix));
  if (!arg) return null;
  const [, value] = arg.split("=");
  return value?.trim() || null;
}

/* ------------------------- Main ------------------------- */

async function main() {
  const db = admin.firestore();

  const dryRun = hasArg("--dry-run");
  const onlyMissing = hasArg("--only-missing");
  const pageSize = Number(getArgValue("--page-size=") || 500);

  console.log(
    `Starting backfill center (dryRun=${dryRun}, onlyMissing=${onlyMissing}, pageSize=${pageSize})...`
  );

  let last: FirebaseFirestore.QueryDocumentSnapshot | null = null;

  let totalScanned = 0;
  let totalPatched = 0;
  let totalSkipped = 0;
  let totalUndeducible = 0;

  while (true) {
    let q = db
      .collection("client_requests")
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(pageSize);

    if (last) q = q.startAfter(last);

    const snap = await q.get();
    if (snap.empty) break;

    totalScanned += snap.size;

    const batch = db.batch();
    let batchOps = 0;

    for (const doc of snap.docs) {
      const data = doc.data();

      // ✅ canonique d'abord
      const currentCenterId = String(data?.centerId ?? "").trim();
      const currentCenterKey = String(data?.centerKey ?? "").trim();

      // legacy observé
      const legacyAddressId = String(data?.addressId ?? "").trim();

      const inferredCenterId = inferCenterIdFromDoc(data);

      // si pas déductible, on skip
      if (!inferredCenterId) {
        totalSkipped++;
        totalUndeducible++;
        continue;
      }

      const inferredCenterKey = addressIdToKey(inferredCenterId);

      const centerAlreadyOk =
        isAddressId(currentCenterId) && currentCenterKey === inferredCenterKey;

      // mode onlyMissing: on ne touche pas si centerId déjà OK
      if (onlyMissing && isAddressId(currentCenterId)) {
        totalSkipped++;
        continue;
      }

      // si déjà OK (canonique), skip
      if (centerAlreadyOk) {
        totalSkipped++;
        continue;
      }

      // ✅ patch canonique + legacy compat (sans écraser inutilement)
      const now = admin.firestore.FieldValue.serverTimestamp();

      const patch: any = {
        // CANONIQUE ✅
        centerId: inferredCenterId,
        centerKey: inferredCenterKey,

        // LEGACY compat (on met à jour si manquant ou invalide)
        addressId: isAddressId(legacyAddressId) ? legacyAddressId : inferredCenterId,
        addressKey: data?.addressKey ?? inferredCenterKey,
        locationKey: data?.locationKey ?? inferredCenterKey,

        // Coherence utile côté approveSignup déjà existant
        finalAddressId: data?.finalAddressId ?? inferredCenterId,

        updatedAt: now,
        __backfillCenter: {
          inferredCenterId,
          inferredCenterKey,
          previous: {
            centerId: currentCenterId || null,
            centerKey: currentCenterKey || null,
            addressId: legacyAddressId || null,
          },
          at: now,
          version: 2,
        },
      };

      if (!dryRun) batch.set(doc.ref, patch, { merge: true });

      batchOps++;
      totalPatched++;
    }

    if (!dryRun && batchOps > 0) {
      await batch.commit();
      console.log(`Committed batch ops=${batchOps}`);
    }

    last = snap.docs[snap.docs.length - 1] || null;

    console.log(
      `Progress scanned=${totalScanned} patched=${totalPatched} skipped=${totalSkipped} undeducible=${totalUndeducible}`
    );
  }

  console.log("DONE ✅", {
    totalScanned,
    totalPatched,
    totalSkipped,
    totalUndeducible,
    dryRun,
    onlyMissing,
    pageSize,
  });
}

main().catch((e) => {
  console.error("Backfill failed ❌", e);
  process.exit(1);
});
