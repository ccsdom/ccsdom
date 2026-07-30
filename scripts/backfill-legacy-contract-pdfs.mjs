import admin from "firebase-admin";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const args = new Set(process.argv.slice(2));
const repair = args.has("--repair");
const ROOT_DIR = process.cwd();
const BUCKET = "bizhome-hub.firebasestorage.app";

function initAdmin() {
  if (admin.apps.length) return admin.firestore();

  const keyPath = path.resolve(ROOT_DIR, "serviceAccountKey.json");
  if (fs.existsSync(keyPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: BUCKET,
    });
    console.log(`[init] service account loaded from ${keyPath}`);
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: BUCKET,
    });
    console.log("[init] applicationDefault credential in use");
  }

  return admin.firestore();
}

function normalizeString(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeEmail(value) {
  return normalizeString(value).toLowerCase();
}

function normalizeSiret(value) {
  return normalizeString(value).replace(/\D+/g, "");
}

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === "function") return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toTimestamp(value) {
  const date = toDate(value);
  return date ? admin.firestore.Timestamp.fromDate(date) : null;
}

function toIsoString(value) {
  const date = toDate(value);
  return date ? date.toISOString() : null;
}

function formatDateFr(value) {
  const date = toDate(value);
  if (!date) return "";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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

function buildContractCollectionName(addressKey) {
  return addressKey === "paris"
    ? "pdf_requests_contrats_paris"
    : "pdf_requests_contrats_orly";
}

function buildAttestationCollectionName(addressKey) {
  return addressKey === "paris"
    ? "pdf_requests_attestations_paris"
    : "pdf_requests_attestations_orly";
}

function buildContractTemplatePath(addressKey) {
  return addressKey === "paris"
    ? `${BUCKET}/templates/contract_paris.zip`
    : `${BUCKET}/templates/contract_orly.zip`;
}

function buildAttestationTemplatePath(addressKey) {
  return addressKey === "paris"
    ? `${BUCKET}/templates/attestation_paris.zip`
    : `${BUCKET}/templates/attestation_orly.zip`;
}

function resolveLegacyEffectiveDate(clientData) {
  return (
    toTimestamp(clientData.contractEffectiveAt) ||
    toTimestamp(clientData.effectiveAt) ||
    toTimestamp(clientData.joinDate) ||
    toTimestamp(clientData.createdAt) ||
    null
  );
}

function isEligibleLegacyClient(data = {}) {
  const isLegacy =
    data.createdFrom === "legacy_import" ||
    data.billingMode === "legacy_import_no_billing" ||
    Boolean(data.legacyImport?.source);

  const invited =
    data.portalAccess?.status === "invited" ||
    data.activationEmailSent === true ||
    data.accessProvisioned === true;

  return isLegacy && invited;
}

function buildMirror(clientId, clientData) {
  const addressId = resolveAddressId(clientData);
  const addressKey = resolveAddressKey(clientData, addressId) || "orly";
  const effectiveDate = resolveLegacyEffectiveDate(clientData);
  const effectiveDateDisplay = formatDateFr(effectiveDate) || formatDateFr(new Date());
  const companyName = normalizeString(clientData.companyName || clientData.name);
  const representative = normalizeString(clientData.representative || clientData.signatoryName);
  const email = normalizeEmail(clientData.emailLower || clientData.email);
  const legalStatus = normalizeString(clientData.legalStatus || clientData.formeJuridique);
  const siret = normalizeSiret(clientData.siretNorm || clientData.siret) || normalizeString(clientData.siret);
  const planId = normalizeString(clientData.planId || clientData.plan || clientData.mailPlanId);
  const signedAt =
    toIsoString(clientData.signedAt) ||
    toIsoString(effectiveDate) ||
    new Date().toISOString();

  return {
    uid: clientId,
    ownerUid: clientId,
    requestUid: clientId,
    companyName,
    name: companyName,
    representative,
    signatoryName: normalizeString(clientData.signatoryName) || representative || companyName || "Le domicilie",
    email,
    emailLower: email,
    phone: normalizeString(clientData.phone),
    siret,
    siretNorm: normalizeSiret(siret) || null,
    address: normalizeString(clientData.address),
    addressId,
    domiciliationAddressId: addressId,
    addressKey,
    locationKey: addressKey,
    legalStatus,
    formeJuridique: legalStatus,
    mailPlanId: planId || null,
    planId: planId || null,
    plan: planId || null,
    paymentFrequency: clientData.paymentFrequency || "monthly",
    paymentStatus: clientData.paymentStatus || "legacy_import",
    subscriptionStatus: clientData.subscriptionStatus || "active",
    source: "legacy_import",
    createdFrom: "legacy_import",
    status: "approved",
    accessProvisioned: true,
    accessProvisionedReason: "legacy_import_pdf_backfill",
    accessProvisionedAt:
      clientData.accessProvisionedAt ||
      clientData.portalAccess?.invitedAt ||
      admin.firestore.FieldValue.serverTimestamp(),
    approvedAt: clientData.approvedAt || effectiveDate || clientData.joinDate || clientData.createdAt,
    approvedBy: normalizeString(clientData.approvedBy) || "legacy_pdf_backfill",
    createdAt: clientData.joinDate || clientData.createdAt || effectiveDate || admin.firestore.FieldValue.serverTimestamp(),
    joinDate: clientData.joinDate || effectiveDate || null,
    signedAt,
    signedAtDisplay: formatDateFr(signedAt) || effectiveDateDisplay,
    today: effectiveDateDisplay,
    A_COMPTER_DU: effectiveDateDisplay,
    effectiveDateDisplay,
    suppressDocumentReadyEmail: true,
    legacyImport: clientData.legacyImport || null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

function buildJobPayload({ type, addressKey, jobId, mirror }) {
  return {
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    ownerUid: mirror.ownerUid,
    status: "queued",
    template:
      type === "contract"
        ? buildContractTemplatePath(addressKey)
        : buildAttestationTemplatePath(addressKey),
    outputBucket: BUCKET,
    outputName:
      type === "contract"
        ? `contrats-${addressKey}/${jobId}.pdf`
        : `attestations-${addressKey}/${jobId}.pdf`,
    data: {
      ...mirror,
      outputBucket: BUCKET,
    },
  };
}

function writeReport(report) {
  const dir = path.resolve(ROOT_DIR, "outputs/imports/legacy-pdf-backfill");
  fs.mkdirSync(dir, { recursive: true });
  const name = `legacy_pdf_backfill_${new Date().toISOString().replace(/[:.]/g, "-")}${repair ? "-repair" : "-dry-run"}.json`;
  const reportPath = path.join(dir, name);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  return reportPath;
}

const db = initAdmin();
const report = {
  generatedAt: new Date().toISOString(),
  mode: repair ? "repair" : "dry-run",
  summary: {
    scanned: 0,
    eligible: 0,
    missingEmail: 0,
    missingAddressKey: 0,
    alreadyComplete: 0,
    contractJobsToCreate: 0,
    attestationJobsToCreate: 0,
    repaired: 0,
  },
  items: [],
};

const clientsSnap = await db.collection("clients").where("createdFrom", "==", "legacy_import").get();
report.summary.scanned = clientsSnap.size;

for (const clientDoc of clientsSnap.docs) {
  const clientData = clientDoc.data() || {};
  if (!isEligibleLegacyClient(clientData)) continue;
  report.summary.eligible += 1;

  const email = normalizeEmail(clientData.emailLower || clientData.email);
  if (!email) {
    report.summary.missingEmail += 1;
    continue;
  }

  const addressId = resolveAddressId(clientData);
  const addressKey = resolveAddressKey(clientData, addressId);
  if (addressKey !== "orly" && addressKey !== "paris") {
    report.summary.missingAddressKey += 1;
    continue;
  }

  const requestRef = db.collection("client_requests").doc(clientDoc.id);
  const requestSnap = await requestRef.get();
  const requestData = requestSnap.data() || {};
  const existingJobs = {
    ...(clientData.pdfJobs || {}),
    ...(requestData.pdfJobs || {}),
  };
  const needsContract = !existingJobs.contractId;
  const needsAttestation = !existingJobs.attestationId;

  if (!needsContract && !needsAttestation) {
    report.summary.alreadyComplete += 1;
    continue;
  }

  if (needsContract) report.summary.contractJobsToCreate += 1;
  if (needsAttestation) report.summary.attestationJobsToCreate += 1;

  const item = {
    clientId: clientDoc.id,
    companyName: clientData.companyName || clientData.name || null,
    email,
    addressKey,
    effectiveDateDisplay: formatDateFr(resolveLegacyEffectiveDate(clientData)) || null,
    needsContract,
    needsAttestation,
  };
  report.items.push(item);

  if (!repair) continue;

  const mirror = buildMirror(clientDoc.id, clientData);
  const batch = db.batch();
  const pdfJobs = { ...existingJobs };
  const pdfPublish = { ...(requestData.pdfPublish || clientData.pdfPublish || {}) };

  if (needsContract) {
    const contractRef = db.collection(buildContractCollectionName(addressKey)).doc();
    pdfJobs.contractId = contractRef.id;
    pdfPublish.contract = {
      ...(pdfPublish.contract || {}),
      jobId: contractRef.id,
      status: "processing",
      outputUrl: null,
      error: null,
      updatedAt: new Date().toISOString(),
    };
    batch.set(contractRef, buildJobPayload({ type: "contract", addressKey, jobId: contractRef.id, mirror }));
  }

  if (needsAttestation) {
    const attestationRef = db.collection(buildAttestationCollectionName(addressKey)).doc();
    pdfJobs.attestationId = attestationRef.id;
    pdfPublish.attestation = {
      ...(pdfPublish.attestation || {}),
      jobId: attestationRef.id,
      status: "processing",
      outputUrl: null,
      error: null,
      updatedAt: new Date().toISOString(),
    };
    batch.set(attestationRef, buildJobPayload({ type: "attestation", addressKey, jobId: attestationRef.id, mirror }));
  }

  batch.set(requestRef, { ...mirror, pdfJobs, pdfPublish }, { merge: true });
  batch.set(
    db.collection("clients").doc(clientDoc.id),
    {
      pdfJobs,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await batch.commit();
  report.summary.repaired += 1;
}

const reportPath = writeReport(report);
console.log("[done] summary");
console.log(JSON.stringify(report.summary, null, 2));
console.log(`[done] report written to ${reportPath}`);
