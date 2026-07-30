// scripts/list-flagged-client-requests.mjs
import admin from "firebase-admin";

function initAdmin() {
  if (admin.apps.length) return;
  // ✅ Priorité à GOOGLE_APPLICATION_CREDENTIALS (service account JSON)
  // sinon Application Default Credentials (gcloud / firebase)
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

function iso(v) {
  try {
    if (!v) return null;
    if (typeof v.toDate === "function") return v.toDate().toISOString();
    if (v instanceof Date) return v.toISOString();
    return new Date(v).toISOString();
  } catch {
    return String(v);
  }
}

initAdmin();
const db = admin.firestore();

console.log("→ List flagged client_requests (missing center)");
const snap = await db.collection("client_requests").get();

const rows = [];
let rejectedMissing = 0;

for (const doc of snap.docs) {
  const d = doc.data();

  const status = String(d.status || "");
  const addressId = d.addressId ?? null;
  const centerId = d.centerId ?? null;
  const addressKey = d.addressKey ?? null;
  const locationKey = d.locationKey ?? null;
  const centerMissing = typeof d.centerMissing === "boolean" ? d.centerMissing : null;

  const missingCenter =
    !centerId &&
    !addressId &&
    !addressKey &&
    !locationKey;

  // ✅ On ignore les rejected legacy dans la liste principale (sinon bruit)
  if (missingCenter && status.toLowerCase() === "rejected") {
    rejectedMissing += 1;
    continue;
  }

  if (missingCenter) {
    rows.push({
      id: doc.id,
      email: d.email ?? null,
      createdAt: iso(d.createdAt),
      status,
      addressId,
      centerId,
      centerMissing,
      addressKey,
      locationKey,
    });
  }
}

console.table(rows);
console.log({ total: rows.length, rejectedMissing });