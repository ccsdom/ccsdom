import admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const COLLECTION = "client_requests";
// ⚠️ Mets ici l'ID DU DOC QUE TU REGARDES DANS LA CONSOLE
const DOC_ID = process.env.DOC_ID;

if (!DOC_ID) {
  console.error("❌ DOC_ID manquant. Ex: DOC_ID=0YMjcr4DJehNI8eG5IzKahRY8lH2 node functions/scripts/inspect-one-doc.mjs");
  process.exit(1);
}

async function main() {
  const ref = db.collection(COLLECTION).doc(DOC_ID);
  const snap = await ref.get();

  if (!snap.exists) {
    console.log("❌ Doc introuvable:", `${COLLECTION}/${DOC_ID}`);
    process.exit(0);
  }

  const data = snap.data() || {};
  const keys = Object.keys(data).sort();

  console.log("📄", `${COLLECTION}/${DOC_ID}`);
  console.log("✅ top-level keys:", keys);

  console.log("\n🔎 has dotfield 'analysis.status' top-level ? =>", Object.prototype.hasOwnProperty.call(data, "analysis.status"));

  console.log("\n📌 analysis (map):", data.analysis || null);
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
