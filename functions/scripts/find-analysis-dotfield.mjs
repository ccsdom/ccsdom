import admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

async function scan(collectionName) {
  console.log(`\n🔎 Scanning ${collectionName}...`);

  const col = db.collection(collectionName);
  const pageSize = 300;

  let lastDoc = null;
  let scanned = 0;
  let found = 0;

  while (true) {
    let q = col.orderBy(admin.firestore.FieldPath.documentId()).limit(pageSize);
    if (lastDoc) q = q.startAfter(lastDoc);

    const snap = await q.get();
    if (snap.empty) break;

    for (const doc of snap.docs) {
      scanned++;
      const data = doc.data() || {};
      if (Object.prototype.hasOwnProperty.call(data, "analysis.status")) {
        found++;
        console.log(`✅ FOUND dotfield in ${collectionName}/${doc.id}`);
      }
    }

    lastDoc = snap.docs[snap.docs.length - 1];
    console.log(`...progress ${collectionName}: scanned=${scanned}, found=${found}`);
  }

  console.log(`✅ Done ${collectionName}: scanned=${scanned}, found=${found}`);
  return found;
}

async function main() {
  const collections = [
    "client_requests",
    "clients",
    "signup_requests",
    "validation_requests",
    "pdf_requests",
    "pdf_jobs",
  ];

  let totalFound = 0;
  for (const c of collections) {
    try {
      totalFound += await scan(c);
    } catch (e) {
      console.log(`⚠️ Skip ${c} (not found or no permission): ${e?.message || e}`);
    }
  }

  console.log(`\n🎯 TOTAL FOUND: ${totalFound}`);
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Script failed:", e);
  process.exit(1);
});
