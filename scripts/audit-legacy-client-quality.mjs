import admin from "firebase-admin";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT_DIR = process.cwd();
const PROJECT_ID = "bizhome-hub";
const OUT_DIR = path.resolve(ROOT_DIR, "outputs/imports/quality");
const RUN_ID = new Date().toISOString().replace(/[:.]/g, "-");

const CENTER_LABELS = {
  orly_ville: "Orly",
  paris_12e: "Paris 12e",
};

function initAdmin() {
  if (admin.apps.length) return;

  const keyPath = path.resolve(ROOT_DIR, "serviceAccountKey.json");
  if (fs.existsSync(keyPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: PROJECT_ID,
    });
    return;
  }

  admin.initializeApp({ projectId: PROJECT_ID });
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

function normalizePhone(value) {
  return normalizeString(value).replace(/\D+/g, "");
}

function normalizeCenterId(value) {
  const center = normalizeString(value).toLowerCase();
  if (center === "orly") return "orly_ville";
  if (center === "paris") return "paris_12e";
  if (center === "orly_ville" || center === "paris_12e") return center;
  return center || "unknown";
}

function resolveCenterId(data) {
  return normalizeCenterId(
    data.centerId ||
      data.domiciliationAddressId ||
      data.addressId ||
      data.centerKey ||
      data.addressKey ||
      data.locationKey
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getPortalStatus(data) {
  if (data.portalAccess?.status === "invited" || data.activationEmailSent === true) return "invited";
  if (data.accessProvisioned === true && data.legacyImport?.authDisabled === false) return "active";
  if (data.legacyImport?.authDisabled === true) return "pending_invitation";
  return "review";
}

function toCsvValue(value) {
  const text = normalizeString(value);
  if (/[;"\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(filePath, rows, headers) {
  const lines = [
    headers.join(";"),
    ...rows.map((row) => headers.map((header) => toCsvValue(row[header])).join(";")),
  ];
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function issueSeverity(issues) {
  if (issues.some((issue) => issue.startsWith("email_") || issue === "duplicate_email")) return "critical";
  if (issues.some((issue) => issue.includes("siret") || issue.includes("center"))) return "warning";
  if (issues.length > 0) return "minor";
  return "ok";
}

function actionForIssues(issues) {
  if (issues.includes("email_missing")) return "Renseigner un e-mail avant invitation.";
  if (issues.includes("email_invalid")) return "Corriger l'e-mail avant invitation.";
  if (issues.includes("duplicate_email")) return "Choisir le bon titulaire du compte ou créer un e-mail distinct.";
  if (issues.includes("siret_missing")) return "Compléter le SIRET si disponible.";
  if (issues.includes("siret_invalid")) return "Vérifier le SIRET.";
  if (issues.includes("phone_invalid")) return "Vérifier le téléphone.";
  if (issues.includes("center_unknown")) return "Rattacher le client à un centre.";
  return issues.length ? "Vérifier la fiche avant invitation." : "Prêt pour invitation pilote.";
}

async function loadLegacyClients(db) {
  const docs = new Map();
  const queries = [
    db.collection("clients").where("billingMode", "==", "legacy_import_no_billing").get(),
    db.collection("clients").where("createdFrom", "==", "legacy_import").get(),
  ];

  const snapshots = await Promise.all(queries);
  snapshots.forEach((snapshot) => {
    snapshot.docs.forEach((doc) => docs.set(doc.id, doc));
  });

  return Array.from(docs.values());
}

initAdmin();

const db = admin.firestore();
const docs = await loadLegacyClients(db);

const emailGroups = new Map();
const siretGroups = new Map();

const rows = docs.map((doc) => {
  const data = doc.data() || {};
  const email = normalizeEmail(data.emailLower || data.email);
  const siret = normalizeSiret(data.siretNorm || data.siret);
  const phone = normalizePhone(data.phone);
  const centerId = resolveCenterId(data);

  if (email) {
    const group = emailGroups.get(email) || [];
    group.push(doc.id);
    emailGroups.set(email, group);
  }

  if (siret) {
    const group = siretGroups.get(siret) || [];
    group.push(doc.id);
    siretGroups.set(siret, group);
  }

  return {
    clientId: doc.id,
    centerId,
    centerLabel: CENTER_LABELS[centerId] || centerId,
    companyName: normalizeString(data.companyName || data.name),
    representative: normalizeString(data.representative || data.signatoryName),
    email,
    phone,
    siret,
    planId: normalizeString(data.planId || data.plan || data.mailPlanId),
    billingMode: normalizeString(data.billingMode),
    portalStatus: getPortalStatus(data),
    legacySource: normalizeString(data.legacyImport?.source),
    legacyBatchId: normalizeString(data.legacyImport?.batchId),
    sourceRow: normalizeString(data.legacyImport?.sourceRow),
    issues: [],
    severity: "ok",
    recommendedAction: "",
  };
});

for (const row of rows) {
  if (!row.centerId || row.centerId === "unknown") row.issues.push("center_unknown");
  if (!row.companyName) row.issues.push("company_missing");
  if (!row.email) row.issues.push("email_missing");
  else if (!isValidEmail(row.email)) row.issues.push("email_invalid");
  if (!row.siret) row.issues.push("siret_missing");
  else if (row.siret.length !== 14) row.issues.push("siret_invalid");
  if (row.phone && row.phone.length !== 10) row.issues.push("phone_invalid");
  if (row.email && (emailGroups.get(row.email)?.length || 0) > 1) row.issues.push("duplicate_email");
  if (row.siret && row.siret.length === 14 && (siretGroups.get(row.siret)?.length || 0) > 1) {
    row.issues.push("duplicate_siret");
  }
  if (row.portalStatus === "review") row.issues.push("portal_status_review");

  row.issues = Array.from(new Set(row.issues)).sort();
  row.severity = issueSeverity(row.issues);
  row.recommendedAction = actionForIssues(row.issues);
}

rows.sort((a, b) => {
  const centerCompare = a.centerLabel.localeCompare(b.centerLabel, "fr");
  if (centerCompare) return centerCompare;
  const severityOrder = { critical: 0, warning: 1, minor: 2, ok: 3 };
  const severityCompare = severityOrder[a.severity] - severityOrder[b.severity];
  if (severityCompare) return severityCompare;
  return a.companyName.localeCompare(b.companyName, "fr");
});

const issueCounts = {};
const centerCounts = {};
const portalCounts = {};
const severityCounts = {};

for (const row of rows) {
  centerCounts[row.centerId] = (centerCounts[row.centerId] || 0) + 1;
  portalCounts[row.portalStatus] = (portalCounts[row.portalStatus] || 0) + 1;
  severityCounts[row.severity] = (severityCounts[row.severity] || 0) + 1;
  row.issues.forEach((issue) => {
    issueCounts[issue] = (issueCounts[issue] || 0) + 1;
  });
}

const duplicateEmailRows = Array.from(emailGroups.entries())
  .filter(([, ids]) => ids.length > 1)
  .map(([email, ids]) => ({
    email,
    count: ids.length,
    clientIds: ids.join(", "),
    companies: ids
      .map((id) => rows.find((row) => row.clientId === id)?.companyName)
      .filter(Boolean)
      .join(" | "),
  }))
  .sort((a, b) => a.email.localeCompare(b.email, "fr"));

fs.mkdirSync(OUT_DIR, { recursive: true });

const detailCsv = path.resolve(OUT_DIR, `legacy_client_quality_${RUN_ID}.csv`);
const issuesCsv = path.resolve(OUT_DIR, `legacy_client_quality_issues_${RUN_ID}.csv`);
const duplicateCsv = path.resolve(OUT_DIR, `legacy_client_duplicate_emails_${RUN_ID}.csv`);
const summaryJson = path.resolve(OUT_DIR, `legacy_client_quality_summary_${RUN_ID}.json`);

const detailHeaders = [
  "severity",
  "centerLabel",
  "companyName",
  "representative",
  "email",
  "phone",
  "siret",
  "portalStatus",
  "planId",
  "issues",
  "recommendedAction",
  "clientId",
  "legacySource",
  "legacyBatchId",
  "sourceRow",
];

writeCsv(
  detailCsv,
  rows.map((row) => ({ ...row, issues: row.issues.join("|") })),
  detailHeaders
);

writeCsv(
  issuesCsv,
  rows
    .filter((row) => row.severity !== "ok")
    .map((row) => ({ ...row, issues: row.issues.join("|") })),
  detailHeaders
);

writeCsv(duplicateCsv, duplicateEmailRows, ["email", "count", "clientIds", "companies"]);

const summary = {
  generatedAt: new Date().toISOString(),
  projectId: PROJECT_ID,
  totalLegacyClients: rows.length,
  centerCounts,
  portalCounts,
  severityCounts,
  issueCounts,
  duplicateEmailGroups: duplicateEmailRows.length,
  outputs: {
    detailCsv,
    issuesCsv,
    duplicateCsv,
    summaryJson,
  },
};

fs.writeFileSync(summaryJson, JSON.stringify(summary, null, 2), "utf8");

console.log(JSON.stringify(summary, null, 2));

await admin.app().delete();
