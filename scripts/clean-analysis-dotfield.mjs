import admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

async function cleanCollection(collectionName) {
  console.log(`\n🔎 Scanning ${collectionName}...`);

  const col = db.collection(collectionName);
  const pageSize = 300;

  let last = null;
  let scanned = 0;
  let cleaned = 0;

  while (true) {
    let q = col.orderBy(admin.firestore.FieldPath.documentId()).limit(pageSize);
    if (last) q = q.startAfter(last);

    const snap = await q.get();
    if (snap.empty) break;

    const batch = db.batch();
    let writes = 0;

    for (const doc of snap.docs) {
      scanned++;
      const data = doc.data();

      // champ parasite top-level littéral "analysis.status"
      const hasDotField = Object.prototype.hasOwnProperty.call(data, "analysis.status");

      if (hasDotField) {
        batch.update(doc.ref, {
          ["analysis.status"]: admin.firestore.FieldValue.delete(),
        });
        writes++;
        cleaned++;
      }
    }

    if (writes > 0) {
      await batch.commit();
      console.log(`✅ committed batch: ${writes} updates`);
    }

    last = snap.docs[snap.docs.length - 1];
  }

  console.log(`\n📌 Done ${collectionName}: scanned=${scanned}, cleaned=${cleaned}`);
}

await cleanCollection("client_requests");
