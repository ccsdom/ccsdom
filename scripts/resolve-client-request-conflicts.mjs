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

function normalizeComparable(value) {
  return normalizeString(value).toLowerCase();
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

function buildPdfJobConflictPatches(id, requestData, clientData) {
  const patches = [];
  const clientCreatedFrom = normalizeString(clientData.createdFrom).toLowerCase();
  if (clientCreatedFrom !== "client_request") {
    return patches;
  }

  const pairs = [
    {
      field: "pdfJobs.contractId",
      requestValue:
        requestData?.pdfPublish?.contract?.jobId ||
        requestData?.pdfJobs?.contractId ||
        null,
      clientValue: clientData?.pdfJobs?.contractId || null,
    },
    {
      field: "pdfJobs.attestationId",
      requestValue:
        requestData?.pdfPublish?.attestation?.jobId ||
        requestData?.pdfJobs?.attestationId ||
        null,
      clientValue: clientData?.pdfJobs?.attestationId || null,
    },
  ];

  for (const pair of pairs) {
    if (!pair.requestValue || pair.requestValue === pair.clientValue) continue;
    patches.push({
      target: "client",
      id,
      field: pair.field,
      from: pair.clientValue,
      to: pair.requestValue,
      reason: "request_pdf_job_is_current_source",
    });
  }

  return patches;
}

function buildIdentityConflictPatches(id, requestData, clientData) {
  const patches = [];
  const clientFirstName = normalizeString(clientData.firstName);
  const clientLastName = normalizeString(clientData.lastName);
  if (!clientFirstName || !clientLastName) return patches;

  const requestFirstName = normalizeString(requestData.firstName);
  const requestLastName = normalizeString(requestData.lastName);
  if (
    requestFirstName === clientFirstName &&
    requestLastName === clientLastName
  ) {
    return patches;
  }

  const requestRepresentative = normalizeComparable(
    requestData.signatoryName || requestData.representative
  );
  const clientRepresentative = normalizeComparable(
    clientData.signatoryName || clientData.representative
  );

  if (!requestRepresentative || !clientRepresentative) return patches;
  if (requestRepresentative !== clientRepresentative) return patches;

  patches.push(
    {
      target: "request",
      id,
      field: "firstName",
      from: requestData.firstName ?? null,
      to: clientFirstName,
      reason: "client_identity_matches_signatory",
    },
    {
      target: "request",
      id,
      field: "lastName",
      from: requestData.lastName ?? null,
      to: clientLastName,
      reason: "client_identity_matches_signatory",
    }
  );

  return patches;
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

async function main() {
  const db = loadAdmin();
  const [requestSnap, clientSnap] = await Promise.all([
    db.collection("client_requests").get(),
    db.collection("clients").get(),
  ]);

  const requestMap = new Map(requestSnap.docs.map((doc) => [doc.id, doc]));
  const clientMap = new Map(clientSnap.docs.map((doc) => [doc.id, doc]));
  const sharedIds = [...clientMap.keys()].filter((id) => requestMap.has(id));

  const report = {
    generatedAt: new Date().toISOString(),
    mode: repair ? "repair" : "audit",
    summary: {
      sharedIds: sharedIds.length,
      detectedPatches: 0,
      requestDocsUpdated: 0,
      clientDocsUpdated: 0,
    },
    patches: [],
  };

  for (const id of sharedIds) {
    const requestData = requestMap.get(id)?.data() || {};
    const clientData = clientMap.get(id)?.data() || {};
    const patchPlan = [
      ...buildPdfJobConflictPatches(id, requestData, clientData),
      ...buildIdentityConflictPatches(id, requestData, clientData),
    ];

    if (patchPlan.length === 0) continue;
    report.summary.detectedPatches += patchPlan.length;
    report.patches.push(...patchPlan);

    if (!repair) continue;

    const requestPatch = {};
    const clientPatch = {};
    for (const patch of patchPlan) {
      if (patch.target === "request") {
        setByPath(requestPatch, patch.field, patch.to);
      } else {
        setByPath(clientPatch, patch.field, patch.to);
      }
    }

    if (Object.keys(requestPatch).length > 0) {
      requestPatch.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      await requestMap.get(id).ref.set(requestPatch, { merge: true });
      report.summary.requestDocsUpdated += 1;
    }

    if (Object.keys(clientPatch).length > 0) {
      clientPatch.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      await clientMap.get(id).ref.set(clientPatch, { merge: true });
      report.summary.clientDocsUpdated += 1;
    }
  }

  const reportName = `resolve-client-request-conflicts-report-${new Date()
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
