import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_BUCKET = "bizhome-hub.firebasestorage.app";

const args = new Set(process.argv.slice(2));
const repair = args.has("--repair");
const scopeArg = [...args].find((arg) => arg.startsWith("--scope="));
const limitArg = [...args].find((arg) => arg.startsWith("--limit="));
const scope = (scopeArg?.split("=")[1] || "all").trim().toLowerCase();
const limit = Number(limitArg?.split("=")[1] || "0") || 0;

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function buildTokenUrl(bucketName, filePath, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
}

function extractUrlToken(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return null;

  try {
    return new URL(rawUrl).searchParams.get("token");
  } catch {
    return null;
  }
}

function normalizeAddressKey(value) {
  const text = String(value || "").trim().toLowerCase();
  if (text === "orly") return "orly";
  if (text === "paris") return "paris";
  if (text.includes("orly")) return "orly";
  if (text.includes("paris")) return "paris";
  return null;
}

function inferPdfPath(kind, addressKey, jobId) {
  const normalizedAddressKey = normalizeAddressKey(addressKey);
  const normalizedJobId = String(jobId || "").trim();
  if (!normalizedAddressKey || !normalizedJobId) return null;

  if (kind === "contract") {
    return `contrats-${normalizedAddressKey}/${normalizedJobId}.pdf`;
  }

  if (kind === "attestation") {
    return `attestations-${normalizedAddressKey}/${normalizedJobId}.pdf`;
  }

  if (kind === "invoice") {
    return `invoices-${normalizedAddressKey}/${normalizedJobId}.pdf`;
  }

  return null;
}

function parseStorageReference(rawValue, bucketFallback = DEFAULT_BUCKET) {
  if (!rawValue || typeof rawValue !== "string") {
    return null;
  }

  if (rawValue.startsWith("gs://")) {
    const withoutScheme = rawValue.slice(5);
    const slashIndex = withoutScheme.indexOf("/");
    if (slashIndex === -1) return null;

    return {
      bucketName: withoutScheme.slice(0, slashIndex),
      filePath: withoutScheme.slice(slashIndex + 1),
    };
  }

  try {
    const url = new URL(rawValue);

    if (url.hostname === "firebasestorage.googleapis.com") {
      const match = url.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/);
      if (!match) return null;

      return {
        bucketName: decodeURIComponent(match[1]),
        filePath: decodeURIComponent(match[2]),
      };
    }

    if (url.hostname.endsWith(".firebasestorage.app")) {
      return {
        bucketName: url.hostname,
        filePath: decodeURIComponent(url.pathname.replace(/^\/+/, "")),
      };
    }
  } catch {
    // Ignore URL parsing failure and try relative path fallback below.
  }

  if (rawValue.includes("/") && !rawValue.startsWith("http")) {
    return {
      bucketName: bucketFallback,
      filePath: rawValue.replace(/^\/+/, ""),
    };
  }

  return null;
}

function readTokens(metadata) {
  const value = metadata?.metadata?.firebaseStorageDownloadTokens;
  if (!value || typeof value !== "string") return [];

  return value
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);
}

function loadAdmin() {
  const serviceAccountPath = path.resolve(ROOT_DIR, "serviceAccountKey.json");

  if (!admin.apps.length) {
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: DEFAULT_BUCKET,
      });
      console.log(`[init] service account loaded from ${serviceAccountPath}`);
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: DEFAULT_BUCKET,
      });
      console.log("[init] applicationDefault credential in use");
    }
  }

  return {
    db: admin.firestore(),
    storage: admin.storage(),
  };
}

async function inspectStorageObject(storage, reference, preferredToken, allowRepair) {
  const file = storage.bucket(reference.bucketName).file(reference.filePath);
  const [exists] = await file.exists();

  if (!exists) {
    return {
      ok: false,
      reason: "missing_file",
      bucketName: reference.bucketName,
      filePath: reference.filePath,
    };
  }

  const [metadata] = await file.getMetadata();
  const tokens = readTokens(metadata);

  let selectedToken =
    (preferredToken && tokens.includes(preferredToken) && preferredToken) ||
    tokens[0] ||
    null;
  let repairedMetadata = false;

  if (!selectedToken && allowRepair) {
    selectedToken = preferredToken || randomUUID();
    await file.setMetadata({
      metadata: {
        ...(metadata.metadata || {}),
        firebaseStorageDownloadTokens: selectedToken,
      },
    });
    repairedMetadata = true;
  }

  return {
    ok: true,
    bucketName: reference.bucketName,
    filePath: reference.filePath,
    selectedToken,
    canonicalUrl: selectedToken
      ? buildTokenUrl(reference.bucketName, reference.filePath, selectedToken)
      : null,
    repairedMetadata,
    contentType: metadata.contentType || null,
    size: metadata.size || null,
  };
}

function pushIssue(report, issue) {
  report.issues.push(issue);
  report.summary.flagged += 1;
}

async function processClientRequests({ db, storage, report }) {
  let query = db.collection("client_requests");
  if (limit > 0) {
    query = query.limit(limit);
  }

  const snapshot = await query.get();
  report.summary.clientRequestsScanned = snapshot.size;

  for (const doc of snapshot.docs) {
    const data = doc.data() || {};
    const updatePayload = {};

    for (const kind of ["contract", "attestation"]) {
      const published = data.pdfPublish?.[kind];
      if (!published) continue;

      report.summary.pdfEntriesScanned += 1;

      const currentUrl = published.outputUrl || published.fileUrl || published.url || null;
      const inferredPath = inferPdfPath(kind, data.addressKey || data.locationKey || data.addressId, published.jobId);
      const reference = parseStorageReference(currentUrl) || parseStorageReference(inferredPath);
      if (!reference) {
        pushIssue(report, {
          collection: "client_requests",
          docId: doc.id,
          kind,
          issue: "unresolved_reference",
          currentUrl,
          inferredPath,
        });
        continue;
      }

      const preferredToken = extractUrlToken(currentUrl);
      const inspection = await inspectStorageObject(storage, reference, preferredToken, repair);

      if (!inspection.ok) {
        pushIssue(report, {
          collection: "client_requests",
          docId: doc.id,
          kind,
          issue: inspection.reason,
          filePath: reference.filePath,
          currentUrl,
        });
        continue;
      }

      if (inspection.repairedMetadata) {
        report.summary.storageTokensCreated += 1;
      }

      if (!inspection.canonicalUrl) {
        pushIssue(report, {
          collection: "client_requests",
          docId: doc.id,
          kind,
          issue: "missing_download_token",
          filePath: inspection.filePath,
          currentUrl,
        });
        continue;
      }

      if (inspection.canonicalUrl !== currentUrl) {
        report.summary.firestoreUpdatesNeeded += 1;
        pushIssue(report, {
          collection: "client_requests",
          docId: doc.id,
          kind,
          issue: "stale_output_url",
          filePath: inspection.filePath,
          currentUrl,
          canonicalUrl: inspection.canonicalUrl,
        });
        if (repair) {
          updatePayload[`pdfPublish.${kind}.outputUrl`] = inspection.canonicalUrl;
        }
      }
    }

    if (repair && Object.keys(updatePayload).length > 0) {
      updatePayload.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      await doc.ref.update(updatePayload);
      report.summary.firestoreDocsUpdated += 1;
    }
  }
}

async function processInvoices({ db, storage, report }) {
  let query = db.collection("invoices");
  if (limit > 0) {
    query = query.limit(limit);
  }

  const snapshot = await query.get();
  report.summary.invoicesScanned = snapshot.size;

  for (const doc of snapshot.docs) {
    const data = doc.data() || {};
    const pdf = data.pdf;
    if (!pdf) continue;

    report.summary.pdfEntriesScanned += 1;

    const currentUrl = pdf.outputUrl || pdf.fileUrl || pdf.url || null;
    const inferredPath = inferPdfPath(
      "invoice",
      data.addressKey || data.snapshot?.seller?.addressKey || data.snapshot?.client?.addressKey,
      pdf.jobId,
    );
    const reference =
      parseStorageReference(pdf.storagePath) ||
      parseStorageReference(currentUrl) ||
      parseStorageReference(pdf.outputName) ||
      parseStorageReference(pdf.output) ||
      parseStorageReference(inferredPath);

    if (!reference) {
      pushIssue(report, {
        collection: "invoices",
        docId: doc.id,
        kind: "invoice",
        issue: "unresolved_reference",
        currentUrl,
        storagePath: pdf.storagePath || null,
        inferredPath,
      });
      continue;
    }

    const preferredToken =
      extractUrlToken(currentUrl) ||
      extractUrlToken(pdf.fileUrl) ||
      extractUrlToken(pdf.url);
    const inspection = await inspectStorageObject(storage, reference, preferredToken, repair);

    if (!inspection.ok) {
      pushIssue(report, {
        collection: "invoices",
        docId: doc.id,
        kind: "invoice",
        issue: inspection.reason,
        filePath: reference.filePath,
        currentUrl,
      });
      continue;
    }

    if (inspection.repairedMetadata) {
      report.summary.storageTokensCreated += 1;
    }

    if (!inspection.canonicalUrl) {
      pushIssue(report, {
        collection: "invoices",
        docId: doc.id,
        kind: "invoice",
        issue: "missing_download_token",
        filePath: inspection.filePath,
        currentUrl,
      });
      continue;
    }

    const needsUpdate =
      inspection.canonicalUrl !== (pdf.outputUrl || null) ||
      inspection.canonicalUrl !== (pdf.fileUrl || null) ||
      inspection.canonicalUrl !== (pdf.url || null) ||
      inspection.filePath !== (pdf.storagePath || null);

    if (needsUpdate) {
      report.summary.firestoreUpdatesNeeded += 1;
      pushIssue(report, {
        collection: "invoices",
        docId: doc.id,
        kind: "invoice",
        issue: "stale_output_url",
        filePath: inspection.filePath,
        currentUrl,
        canonicalUrl: inspection.canonicalUrl,
      });
      if (repair) {
        await doc.ref.update({
          "pdf.outputUrl": inspection.canonicalUrl,
          "pdf.fileUrl": inspection.canonicalUrl,
          "pdf.url": inspection.canonicalUrl,
          "pdf.storagePath": inspection.filePath,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        report.summary.firestoreDocsUpdated += 1;
      }
    }
  }
}

async function main() {
  if (!["all", "client_requests", "invoices"].includes(scope)) {
    throw new Error(`Unsupported --scope value: ${scope}`);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    mode: repair ? "repair" : "audit",
    scope,
    limit: limit || null,
    summary: {
      clientRequestsScanned: 0,
      invoicesScanned: 0,
      pdfEntriesScanned: 0,
      flagged: 0,
      firestoreUpdatesNeeded: 0,
      firestoreDocsUpdated: 0,
      storageTokensCreated: 0,
    },
    issues: [],
  };

  const { db, storage } = loadAdmin();

  console.log(`[start] mode=${report.mode} scope=${scope} limit=${limit || "none"}`);

  if (scope === "all" || scope === "client_requests") {
    await processClientRequests({ db, storage, report });
  }

  if (scope === "all" || scope === "invoices") {
    await processInvoices({ db, storage, report });
  }

  const reportName = `pdf-publish-report-${nowStamp()}.json`;
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
