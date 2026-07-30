// scripts/migrate-client-requests-centerId.mjs
import admin from "firebase-admin";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// 1) Init Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

const VALID_CENTERS = new Set(["paris_12e", "orly_ville"]);

function normalizeCenter(v) {
  const s = (v || "").toString().trim();
  if (VALID_CENTERS.has(s)) return s;
  return null;
}

async function main() {
  console.log("→ Migration client_requests : centerId backfill");
  const col = db.collection("client_requests");

  let last = null;
  let updated = 0;
  let flagged = 0;
  let scanned = 0;

  while (true) {
    let q = col.orderBy(admin.firestore.FieldPath.documentId()).limit(400);
    if (last) q = q.startAfter(last);

    const snap = await q.get();
    if (snap.empty) break;

    const batch = db.batch();

    for (const doc of snap.docs) {
      scanned++;
      const data = doc.data() || {};

      const centerId = normalizeCenter(data.centerId);
      const addressId = normalizeCenter(data.addressId);

      // Déjà ok
      if (centerId) continue;

      // Backfill depuis addressId
      if (addressId) {
        batch.update(doc.ref, {
          centerId: addressId,
          centerMissing: false,
          centerMigratedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        updated++;
        continue;
      }

      // Indéductible
      batch.update(doc.ref, {
        centerMissing: true,
        centerMigratedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      flagged++;
    }

    await batch.commit();
    last = snap.docs[snap.docs.length - 1].id;
    console.log(`…scanned=${scanned} updated=${updated} flagged=${flagged}`);
  }

  console.log("✅ Terminé");
  console.log({ scanned, updated, flagged });
}

main().catch((e) => {
  console.error("❌ Migration failed:", e);
  process.exit(1);
});