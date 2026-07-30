import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const args = new Set(process.argv.slice(2));
const repair = args.has("--repair");

function normalizeString(value) {
  return String(value ?? "").trim();
}

function normalizeEmailLower(value) {
  return normalizeString(value).toLowerCase();
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function resolveBoolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function loadAdmin() {
  const serviceAccountPath = path.resolve(ROOT_DIR, "serviceAccountKey.json");

  if (!admin.apps.length) {
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "bizhome-hub.firebasestorage.app",
      });
      console.log(`[init] service account loaded from ${serviceAccountPath}`);
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: "bizhome-hub.firebasestorage.app",
      });
      console.log("[init] applicationDefault credential in use");
    }
  }

  return admin.firestore();
}

function toIso(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }
  return value;
}

function buildClientMirror(requestId, requestData) {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const ownerUid = normalizeString(requestData.ownerUid || requestData.uid || requestId);
  const emailLower = normalizeEmailLower(requestData.email || requestData.emailLower);
  const firstName = normalizeString(requestData.firstName);
  const lastName = normalizeString(requestData.lastName);
  const representative =
    normalizeString(requestData.representative) ||
    `${firstName} ${lastName}`.trim();
  const companyName = normalizeString(requestData.companyName || requestData.name);
  const addressKey = normalizeString(requestData.addressKey || requestData.locationKey || "orly");

  return {
    uid: ownerUid,
    requestUid: requestId,
    ownerUid,
    email: emailLower || null,
    emailLower: emailLower || null,
    companyName: companyName || "",
    name: companyName || "",
    firstName: firstName || "",
    lastName: lastName || "",
    representative: representative || "",
    phone: normalizeString(requestData.phone) || "",
    address: normalizeString(requestData.address) || "",
    addressKey: addressKey || "orly",
    addressId: requestData.addressId || null,
    domiciliationAddressId: requestData.addressId || null,
    legalStatus: normalizeString(requestData.legalStatus) || "",
    projectType: requestData.projectType || null,
    accompanimentType: requestData.accompanimentType || null,
    mailPlanId: requestData.mailPlanId || null,
    plan: requestData.mailPlanId || null,
    paymentFrequency: requestData.paymentFrequency || null,
    paymentStatus: requestData.paymentStatus || "paid",
    ...(isPlainObject(requestData.stripeCheckout)
      ? { stripeCheckout: requestData.stripeCheckout }
      : {}),
    signatureUrl: requestData.signatureUrl || null,
    signatoryName:
      normalizeString(requestData.signatoryName) ||
      representative ||
      companyName ||
      "",
    signedAt: requestData.signedAt || null,
    pdfJobs: isPlainObject(requestData.pdfJobs) ? requestData.pdfJobs : {},
    documents: isPlainObject(requestData.documents) ? requestData.documents : {},
    documentsUploadMeta: isPlainObject(requestData.documentsUploadMeta)
      ? requestData.documentsUploadMeta
      : {},
    documentsAnalysis: isPlainObject(requestData.documentsAnalysis)
      ? requestData.documentsAnalysis
      : {},
    docsRequiredCompleted: resolveBoolean(requestData.docsRequiredCompleted, false),
    documentsRequiredCompleted: resolveBoolean(
      requestData.documentsRequiredCompleted,
      false
    ),
    accessProvisioned: requestData.accessProvisioned === true,
    accessProvisionedAt: requestData.accessProvisionedAt || now,
    accessProvisionedReason: requestData.accessProvisionedReason || null,
    source: normalizeString(requestData.source) || "public_onboarding",
    createdFrom: "client_request",
    status: "active",
    joinDate: requestData.approvedAt || requestData.createdAt || now,
    approvedAt: requestData.approvedAt || now,
    approvedBy: requestData.approvedBy || "backfill_provisioned_request",
    updatedAt: now,
    createdAt: requestData.createdAt || now,
  };
}

async function main() {
  const db = loadAdmin();
  const requestSnap = await db.collection("client_requests").get();
  const report = {
    generatedAt: new Date().toISOString(),
    mode: repair ? "repair" : "audit",
    summary: {
      requestDocsScanned: requestSnap.size,
      eligibleProvisionedRequests: 0,
      missingClientDocs: 0,
      repaired: 0,
    },
    missing: [],
  };

  for (const doc of requestSnap.docs) {
    const requestData = doc.data() || {};
    const isApproved = normalizeString(requestData.status).toLowerCase() === "approved";
    const isProvisioned = requestData.accessProvisioned === true;

    if (!isApproved || !isProvisioned) continue;
    report.summary.eligibleProvisionedRequests += 1;

    const ownerUid = normalizeString(requestData.ownerUid || requestData.uid || doc.id);
    if (!ownerUid) continue;

    const clientRef = db.doc(`clients/${ownerUid}`);
    const clientSnap = await clientRef.get();
    if (clientSnap.exists) continue;

    report.summary.missingClientDocs += 1;
    report.missing.push({
      requestId: doc.id,
      ownerUid,
      email: requestData.email || requestData.emailLower || null,
      companyName: requestData.companyName || requestData.name || null,
      status: requestData.status || null,
      accessProvisioned: requestData.accessProvisioned ?? null,
      approvedAt: toIso(requestData.approvedAt),
      createdAt: toIso(requestData.createdAt),
    });

    if (!repair) continue;

    const clientPayload = buildClientMirror(doc.id, requestData);
    await clientRef.set(clientPayload, { merge: true });
    report.summary.repaired += 1;
  }

  const reportName = `provisioned-client-mirror-report-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.json`;
  const reportPath = path.resolve(ROOT_DIR, reportName);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log("[done] summary");
  console.log(JSON.stringify(report.summary, null, 2));
  console.log(`[done] report written to ${reportPath}`);
}

main().catch((error) => {
  console.error("[fatal]", error);
  process.exit(1);
});
