import admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

async function cleanCollection(collectionName) {
  console.log(`\n🔎 Scanning ${collectionName}...`);

  const col = db.collection(collectionName);
  const pageSize = 300;

  let lastDoc = null;
  let scanned = 0;
  let cleaned = 0;

  while (true) {
    let q = col.orderBy(admin.firestore.FieldPath.documentId()).limit(pageSize);
    if (lastDoc) q = q.startAfter(lastDoc);

    const snap = await q.get();
    if (snap.empty) break;

    const batch = db.batch();

    snap.docs.forEach((doc) => {
      scanned++;

      const data = doc.data() || {};
      // ⚠️ Le "mauvais" champ à supprimer : analysis.status (avec un point dans le nom)
      const hasBadDotField =
        Object.prototype.hasOwnProperty.call(data, "analysis.status");

      if (hasBadDotField) {
        cleaned++;
        batch.update(doc.ref, {
          "analysis.status": admin.firestore.FieldValue.delete(),
        });
      }
    });

    if (cleaned > 0) {
      await batch.commit();
    }

    lastDoc = snap.docs[snap.docs.length - 1];

    console.log(`...progress ${collectionName}: scanned=${scanned}, cleaned=${cleaned}`);
  }

  console.log(`✅ Done ${collectionName}: scanned=${scanned}, cleaned=${cleaned}`);
}

async function main() {
  await cleanCollection("client_requests");
  console.log("\n🎉 All done.");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Script failed:", e);
  process.exit(1);
});
