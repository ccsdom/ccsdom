// scripts/patch-legacy-rejected-center.mjs
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const IDS = [
  "FSHF3pPytINrI5KBab7a6YbO4ly2",
  "P2HYuL7SAzeEhcaEV4rqldKpjGA3",
  "aaa0MliONsSa7Llnz4IkoDOJlGo1",
  "sxpNttYsIfed6JyQ0fj1axM28uP2",
];

console.log("→ Patch legacy rejected (center missing)");

let updated = 0;

for (const id of IDS) {
  const ref = db.collection("client_requests").doc(id);
  const snap = await ref.get();
  if (!snap.exists) continue;

  const d = snap.data() || {};
  const status = String(d.status || "");

  // On ne touche que les rejected (sécurité)
  if (status !== "rejected") {
    console.log(`- skip ${id} (status=${status})`);
    continue;
  }

  await ref.set(
    {
      centerMissing: true,
      centerNote: "legacy_rejected_without_center",
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  updated++;
  console.log(`+ patched ${id}`);
}

console.log("✅ Terminé", { updated });