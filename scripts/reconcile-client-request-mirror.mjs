import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const args = new Set(process.argv.slice(2));
const repair = args.has("--repair");
const limitArg = [...args].find((arg) => arg.startsWith("--limit="));
const limit = Number(limitArg?.split("=")[1] || "0") || 0;

function isEmpty(value) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  );
}

function getByPath(object, pathValue) {
  return pathValue.split(".").reduce((acc, key) => acc?.[key], object);
}

function setByPath(target, pathValue, value) {
  const keys = pathValue.split(".");
  let cursor = target;

  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    cursor[key] = cursor[key] && typeof cursor[key] === "object" ? cursor[key] : {};
    cursor = cursor[key];
  }

  cursor[keys[keys.length - 1]] = value;
}

function normalizeEmailLower(value) {
  const text = String(value ?? "").trim().toLowerCase();
  return text || null;
}

function normalizeAddressKey(value) {
  const text = String(value ?? "").trim().toLowerCase();
  if (text === "paris" || text === "orly") return text;
  if (text.includes("paris")) return "paris";
  if (text.includes("orly")) return "orly";
  return null;
}

function resolveCandidate(field, clientData) {
  switch (field) {
    case "ownerUid":
      return clientData.ownerUid || clientData.uid || null;
    case "email":
      return clientData.email || clientData.emailLower || null;
    case "emailLower":
      return normalizeEmailLower(clientData.emailLower || clientData.email);
    case "addressKey":
      return normalizeAddressKey(clientData.addressKey || clientData.locationKey || clientData.addressId);
    case "locationKey":
      return normalizeAddressKey(clientData.locationKey || clientData.addressKey || clientData.addressId);
    case "addressId":
      return (
        String(clientData.addressId || clientData.domiciliationAddressId || "").trim() ||
        null
      );
    case "companyName":
      return clientData.companyName || clientData.name || null;
    case "firstName":
      return clientData.firstName || null;
    case "lastName":
      return clientData.lastName || null;
    case "representative":
      return clientData.representative || clientData.signatoryName || null;
    case "signatoryName":
      return clientData.signatoryName || clientData.representative || null;
    case "signatureUrl":
      return clientData.signatureUrl || null;
    case "signedAt":
      return clientData.signedAt || null;
    case "pdfJobs.contractId":
      return clientData.pdfJobs?.contractId || null;
    case "pdfJobs.attestationId":
      return clientData.pdfJobs?.attestationId || null;
    default:
      return null;
  }
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

const MIRROR_FIELDS = [
  "ownerUid",
  "email",
  "emailLower",
  "addressKey",
  "locationKey",
  "addressId",
  "companyName",
  "firstName",
  "lastName",
  "representative",
  "signatoryName",
  "signatureUrl",
  "signedAt",
  "pdfJobs.contractId",
  "pdfJobs.attestationId",
];

async function main() {
  const db = loadAdmin();
  const report = {
    generatedAt: new Date().toISOString(),
    mode: repair ? "repair" : "audit",
    limit: limit || null,
    summary: {
      requestCount: 0,
      clientCount: 0,
      sharedIds: 0,
      onlyRequests: 0,
      onlyClients: 0,
      missingFieldPatches: 0,
      requestDocsUpdated: 0,
      conflicts: 0,
    },
    orphanIds: {
      onlyRequests: [],
      onlyClients: [],
    },
    patches: [],
    conflicts: [],
  };

  let requestsQuery = db.collection("client_requests");
  let clientsQuery = db.collection("clients");
  if (limit > 0) {
    requestsQuery = requestsQuery.limit(limit);
    clientsQuery = clientsQuery.limit(limit);
  }

  const [requestSnap, clientSnap] = await Promise.all([requestsQuery.get(), clientsQuery.get()]);
  report.summary.requestCount = requestSnap.size;
  report.summary.clientCount = clientSnap.size;

  const requestMap = new Map(requestSnap.docs.map((doc) => [doc.id, doc]));
  const clientMap = new Map(clientSnap.docs.map((doc) => [doc.id, doc]));

  const requestIds = new Set(requestMap.keys());
  const clientIds = new Set(clientMap.keys());

  report.orphanIds.onlyRequests = [...requestIds].filter((id) => !clientIds.has(id));
  report.orphanIds.onlyClients = [...clientIds].filter((id) => !requestIds.has(id));
  report.summary.onlyRequests = report.orphanIds.onlyRequests.length;
  report.summary.onlyClients = report.orphanIds.onlyClients.length;

  const sharedIds = [...clientIds].filter((id) => requestIds.has(id));
  report.summary.sharedIds = sharedIds.length;

  for (const id of sharedIds) {
    const requestData = requestMap.get(id)?.data() || {};
    const clientData = clientMap.get(id)?.data() || {};
    const patch = {};

    for (const field of MIRROR_FIELDS) {
      const requestValue = getByPath(requestData, field);
      const candidateValue = resolveCandidate(field, clientData);

      if (isEmpty(candidateValue)) {
        continue;
      }

      if (isEmpty(requestValue)) {
        setByPath(patch, field, candidateValue);
        report.summary.missingFieldPatches += 1;
        report.patches.push({
          id,
          field,
          from: requestValue ?? null,
          to: candidateValue,
        });
        continue;
      }

      if (JSON.stringify(requestValue) !== JSON.stringify(candidateValue)) {
        report.summary.conflicts += 1;
        report.conflicts.push({
          id,
          field,
          requestValue,
          clientValue: candidateValue,
        });
      }
    }

    if (repair && Object.keys(patch).length > 0) {
      patch.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      await requestMap.get(id).ref.set(patch, { merge: true });
      report.summary.requestDocsUpdated += 1;
    }
  }

  const reportName = `client-request-reconcile-report-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
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
