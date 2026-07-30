import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import admin from "firebase-admin";

const args = new Set(process.argv.slice(2));
const repair = args.has("--repair");

function getReportPath() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.resolve(
    process.cwd(),
    `admin-client-request-orphans-report-${timestamp}.json`
  );
}

function stripUndefined(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)
  );
}

function normalizeString(value) {
  return String(value ?? "").trim();
}

function normalizeEmailLower(value) {
  return normalizeString(value).toLowerCase();
}

function resolveAddressId(data = {}) {
  const raw = normalizeString(
    data.domiciliationAddressId ||
      data.addressId ||
      data.centerId ||
      data.locationKey ||
      data.addressKey
  ).toLowerCase();
  if (raw === "orly" || raw === "orly_ville") return "orly_ville";
  if (raw === "paris" || raw === "paris_12e") return "paris_12e";
  return raw || "";
}

function resolveAddressKey(data = {}, addressId = "") {
  const raw = normalizeString(data.addressKey || data.locationKey).toLowerCase();
  if (raw === "orly" || raw === "paris") return raw;
  if (addressId === "orly_ville") return "orly";
  if (addressId === "paris_12e") return "paris";
  return raw || "";
}

function resolveLocationKey(data = {}, addressKey = "", addressId = "") {
  const raw = normalizeString(data.locationKey || data.addressKey).toLowerCase();
  if (raw === "orly" || raw === "paris") return raw;
  if (addressKey === "orly" || addressKey === "paris") return addressKey;
  if (addressId === "orly_ville") return "orly";
  if (addressId === "paris_12e") return "paris";
  return raw || "";
}

function buildAdminClientRequestMirror(uid, clientData, now) {
  const addressId = resolveAddressId(clientData);
  const addressKey = resolveAddressKey(clientData, addressId);
  const locationKey = resolveLocationKey(clientData, addressKey, addressId);
  const email = normalizeEmailLower(clientData.email || clientData.emailLower);
  const companyName = normalizeString(clientData.companyName || clientData.name);
  const representative = normalizeString(clientData.representative);
  const mailPlanId = normalizeString(clientData.planId || clientData.plan);

  return stripUndefined({
    uid,
    ownerUid: uid,
    companyName: companyName || undefined,
    name: companyName || undefined,
    representative: representative || undefined,
    signatoryName: representative || undefined,
    email: email || undefined,
    emailLower: email || undefined,
    phone: normalizeString(clientData.phone) || undefined,
    siret:
      normalizeString(clientData.siret || clientData.siretNorm) || undefined,
    address: normalizeString(clientData.address) || undefined,
    addressId: addressId || undefined,
    addressKey: addressKey || undefined,
    locationKey: locationKey || undefined,
    mailPlanId: mailPlanId || undefined,
    status: "approved",
    source: "admin_manual_client",
    accessProvisioned: true,
    accessProvisionedReason: "admin_created",
    createdAt: clientData.createdAt || clientData.joinDate || now,
    approvedAt: clientData.approvedAt || clientData.joinDate || now,
    approvedBy: normalizeString(clientData.approvedBy) || "system_backfill",
    accessProvisionedAt:
      clientData.accessProvisionedAt || clientData.joinDate || now,
    updatedAt: now,
  });
}

const keyPath = path.resolve(process.cwd(), "serviceAccountKey.json");
if (!admin.apps.length) {
  if (fs.existsSync(keyPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log(`[init] service account loaded from ${keyPath}`);
  } else {
    admin.initializeApp();
    console.log("[init] using application default credentials");
  }
}

const db = admin.firestore();
const report = {
  generatedAt: new Date().toISOString(),
  mode: repair ? "repair" : "audit",
  summary: {
    adminClientsScanned: 0,
    missingRequestDocs: 0,
    repaired: 0,
  },
  missing: [],
};

const clientsSnap = await db
  .collection("clients")
  .where("createdFrom", "==", "admin")
  .get();

report.summary.adminClientsScanned = clientsSnap.size;

for (const clientDoc of clientsSnap.docs) {
  const clientData = clientDoc.data() || {};
  const requestRef = db.collection("client_requests").doc(clientDoc.id);
  const requestSnap = await requestRef.get();
  if (requestSnap.exists) continue;

  report.summary.missingRequestDocs += 1;
  report.missing.push({
    id: clientDoc.id,
    email: clientData.email || null,
    companyName: clientData.companyName || clientData.name || null,
    addressKey: clientData.addressKey || null,
  });

  if (repair) {
    await requestRef.set(
      buildAdminClientRequestMirror(
        clientDoc.id,
        { ...clientData, uid: clientDoc.id },
        admin.firestore.FieldValue.serverTimestamp()
      ),
      { merge: true }
    );
    report.summary.repaired += 1;
  }
}

const reportPath = getReportPath();
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log("[done] summary");
console.log(JSON.stringify(report.summary, null, 2));
console.log(`[done] report written to ${reportPath}`);
