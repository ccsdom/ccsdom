import admin from "firebase-admin";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT_DIR = process.cwd();
const args = process.argv.slice(2);
const profileKey = normalizeProfileKey(readArg("--profile") || readArg("--center") || "orly");
const PROFILES = {
  orly: {
    source: "outputs/imports/orly/orly_clients_import_ready.csv",
    addressId: "orly_ville",
    addressKey: "orly",
    batchPrefix: "orly_legacy_import",
    importSource: "orly_excel_reprise",
    reportDir: "orly",
    legacyIdPrefix: "legacy_orly",
  },
  paris: {
    source: "outputs/imports/paris/paris_clients_import_ready.csv",
    addressId: "paris_12e",
    addressKey: "paris",
    batchPrefix: "paris_legacy_import",
    importSource: "paris_excel_reprise",
    reportDir: "paris",
    legacyIdPrefix: "legacy_paris",
  },
};
const profile = PROFILES[profileKey];

if (!profile) {
  console.error(`[config] profil inconnu: ${profileKey}`);
  console.error(`[config] profils supportes: ${Object.keys(PROFILES).join(", ")}`);
  process.exit(1);
}

const DEFAULT_SOURCE = path.resolve(ROOT_DIR, profile.source);
const PROJECT_ID = "bizhome-hub";
const ADDRESS_ID = profile.addressId;
const ADDRESS_KEY = profile.addressKey;
const PLAN_ID = "classic";
const PAYMENT_FREQUENCY = "monthly";
const CLIENT_STATUS_ACTIVE = "Actif";
const PLAN_AMOUNT_CENTS = 1999;

const commit = args.includes("--commit");
const createAuthDisabled = args.includes("--create-auth-disabled");
const sourceArg = readArg("--source") || DEFAULT_SOURCE;
const limitArg = readArg("--limit");
const limit = limitArg ? Number(limitArg) : 0;
const batchId =
  readArg("--batch-id") ||
  `${profile.batchPrefix}_${new Date().toISOString().replace(/[:.]/g, "-")}`;

function readArg(name) {
  const prefix = `${name}=`;
  const value = args.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length) : "";
}

function normalizeProfileKey(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^paris_12e$/, "paris")
    .replace(/^orly_ville$/, "orly");
  return normalized || "orly";
}

function initAdmin() {
  if (admin.apps.length) return;

  const keyPath = path.resolve(ROOT_DIR, "serviceAccountKey.json");
  if (fs.existsSync(keyPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: PROJECT_ID,
    });
    console.log(`[init] service account loaded from ${keyPath}`);
    return;
  }

  admin.initializeApp({ projectId: PROJECT_ID });
  console.log("[init] using application default credentials");
}

function parseCsvLine(line) {
  const out = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === ";" && !quoted) {
      out.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  out.push(current);
  return out;
}

function parseCsv(filePath) {
  const content = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = normalizeString(values[index]);
    });
    return row;
  });
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

function slugify(value) {
  return normalizeString(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}

function parseDate(value) {
  const text = normalizeString(value);
  if (!text) return null;
  const date = new Date(`${text}T00:00:00.000+01:00`);
  return Number.isNaN(date.getTime()) ? null : admin.firestore.Timestamp.fromDate(date);
}

function addBillingPeriod(startDate, frequency) {
  const end = new Date(startDate);
  if (frequency === "yearly") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return end;
}

function buildImportWarning(row) {
  return normalizeString(row.notes)
    .split(/[;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function deterministicLegacyId(row) {
  const siret = normalizeSiret(row.siret);
  if (siret) return `${profile.legacyIdPrefix}_${siret}`;
  return `${profile.legacyIdPrefix}_${slugify(row.raisonSociale || row.email || crypto.randomUUID())}`;
}

function randomPassword() {
  return `${crypto.randomBytes(18).toString("base64url")}Aa1!`;
}

async function findExistingClientRefs(db, row) {
  const emailLower = normalizeEmail(row.email);
  const siretNorm = normalizeSiret(row.siret);
  const refs = new Map();

  if (emailLower) {
    const byEmail = await db
      .collection("clients")
      .where("emailLower", "==", emailLower)
      .limit(5)
      .get();
    byEmail.docs.forEach((doc) => refs.set(doc.id, "email"));
  }

  if (siretNorm && siretNorm.length === 14) {
    const [bySiret, bySiretNorm] = await Promise.all([
      db.collection("clients").where("siret", "==", siretNorm).limit(5).get(),
      db.collection("clients").where("siretNorm", "==", siretNorm).limit(5).get(),
    ]);
    bySiret.docs.forEach((doc) => refs.set(doc.id, "siret"));
    bySiretNorm.docs.forEach((doc) => refs.set(doc.id, "siretNorm"));
  }

  return Array.from(refs, ([id, reason]) => ({ id, reason }));
}

async function getAuthUser(emailLower) {
  try {
    return await admin.auth().getUserByEmail(emailLower);
  } catch (error) {
    if (error?.code === "auth/user-not-found") return null;
    throw error;
  }
}

function buildClientPayload({ uid, row, now, authDisabled }) {
  const companyName = normalizeString(row.raisonSociale);
  const representative = normalizeString(row.representant);
  const emailLower = normalizeEmail(row.email);
  const siretNorm = normalizeSiret(row.siret);
  const joinDate = parseDate(row.dateEffetDomiciliation) || now;
  const periodStartDate = new Date();
  const periodStart = admin.firestore.Timestamp.fromDate(periodStartDate);
  const periodEnd = admin.firestore.Timestamp.fromDate(
    addBillingPeriod(periodStartDate, PAYMENT_FREQUENCY)
  );
  const warnings = buildImportWarning(row);

  return {
    type: "account",
    createdFrom: "legacy_import",
    uid,
    ownerUid: uid,
    centerId: ADDRESS_ID,
    domiciliationAddressId: ADDRESS_ID,
    addressId: ADDRESS_ID,
    addressKey: ADDRESS_KEY,
    locationKey: ADDRESS_KEY,
    companyName,
    name: companyName,
    representative,
    signatoryName: representative,
    email: emailLower,
    emailLower,
    phone: normalizeString(row.telephone),
    siret: siretNorm || normalizeString(row.siret),
    siretNorm: siretNorm || null,
    legalStatus: normalizeString(row.formeJuridique),
    formeJuridique: normalizeString(row.formeJuridique),
    address: normalizeString(row.adresseClient),
    planId: PLAN_ID,
    plan: PLAN_ID,
    mailPlanId: PLAN_ID,
    tier: PLAN_ID,
    paymentFrequency: PAYMENT_FREQUENCY,
    status: CLIENT_STATUS_ACTIVE,
    paymentStatus: "legacy_import",
    subscriptionStatus: "active",
    subscriptionPlan: PLAN_ID,
    subscriptionAmountCents: PLAN_AMOUNT_CENTS,
    subscriptionRenewalDate: null,
    subscriptionActivatedAt: now,
    subscriptionSource: "legacy_import",
    billingMode: "legacy_import_no_billing",
    subscription: {
      plan: PLAN_ID,
      frequency: PAYMENT_FREQUENCY,
      status: "active",
      amountCents: PLAN_AMOUNT_CENTS,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      activatedAt: now,
      source: "legacy_import",
      billingMode: "legacy_import_no_billing",
    },
    joinDate,
    createdAt: now,
    updatedAt: now,
    legacyImport: {
      batchId,
      source: profile.importSource,
      sourceSheet: row.sourceSheet || null,
      sourceRow: row.sourceRow ? Number(row.sourceRow) : null,
      boite: normalizeString(row.boite) || null,
      notes: warnings,
      needsReview: warnings.length > 0,
      authDisabled,
      importedAt: now,
    },
  };
}

function buildUserPayload({ uid, row, now, authDisabled }) {
  const representative = normalizeString(row.representant);
  const companyName = normalizeString(row.raisonSociale);
  const emailLower = normalizeEmail(row.email);

  return {
    uid,
    email: emailLower,
    emailLower,
    role: "client",
    displayName: representative || companyName,
    managedAddressId: null,
    managedCenterIds: [],
    disabled: authDisabled,
    accountStatus: authDisabled ? "pending_invitation" : "active",
    createdFrom: "legacy_import",
    legacyImport: {
      batchId,
      source: profile.importSource,
      importedAt: now,
      authDisabled,
    },
    createdAt: now,
    updatedAt: now,
  };
}

function buildActivityPayload({ uid, row, now }) {
  return {
    type: "client.legacy_imported",
    createdAt: now,
    actorUid: "legacy_import_script",
    actorRole: "system",
    targetUid: uid,
    targetEmail: normalizeEmail(row.email),
    centerId: ADDRESS_ID,
    centerIds: [ADDRESS_ID],
    details: {
      batchId,
      companyName: normalizeString(row.raisonSociale),
      sourceSheet: row.sourceSheet || null,
      sourceRow: row.sourceRow ? Number(row.sourceRow) : null,
    },
  };
}

async function analyzeRow(db, row) {
  const emailLower = normalizeEmail(row.email);
  const validationErrors = [];

  if (!emailLower || !emailLower.includes("@")) validationErrors.push("email_invalid");
  if (!normalizeString(row.raisonSociale)) validationErrors.push("company_missing");

  const [authUser, existingClients] = await Promise.all([
    emailLower ? getAuthUser(emailLower) : Promise.resolve(null),
    findExistingClientRefs(db, row),
  ]);

  let userDoc = null;
  if (authUser) {
    const userSnap = await db.collection("users").doc(authUser.uid).get();
    userDoc = userSnap.exists ? userSnap.data() || {} : null;
  }

  const existingNonClientRole = userDoc?.role && userDoc.role !== "client";
  const shouldSkip =
    validationErrors.length > 0 ||
    existingClients.length > 0 ||
    Boolean(existingNonClientRole);

  return {
    emailLower,
    authUser,
    userDoc,
    existingClients,
    validationErrors,
    shouldSkip,
    skipReason: validationErrors.length
      ? validationErrors.join(";")
      : existingClients.length
        ? `existing_client:${existingClients.map((item) => item.id).join(",")}`
        : existingNonClientRole
          ? `existing_non_client_role:${userDoc.role}`
          : "",
  };
}

async function commitRow(db, row, analysis, report) {
  const now = admin.firestore.FieldValue.serverTimestamp();
  let authUser = analysis.authUser;
  let createdAuthUser = false;

  if (!authUser && createAuthDisabled) {
    authUser = await admin.auth().createUser({
      email: analysis.emailLower,
      password: randomPassword(),
      displayName: normalizeString(row.representant) || normalizeString(row.raisonSociale),
      disabled: true,
    });
    createdAuthUser = true;
  }

  const uid = authUser?.uid || deterministicLegacyId(row);
  const authDisabled = createdAuthUser ? true : Boolean(authUser?.disabled);
  const clientRef = db.collection("clients").doc(uid);
  const userRef = db.collection("users").doc(uid);
  const activityRef = db.collection("activity_logs").doc();

  const batch = db.batch();
  batch.set(clientRef, buildClientPayload({ uid, row, now, authDisabled }), { merge: false });

  if (authUser) {
    batch.set(userRef, buildUserPayload({ uid, row, now, authDisabled }), { merge: true });
  }

  batch.set(activityRef, buildActivityPayload({ uid, row, now }));
  await batch.commit();

  if (authUser) {
    await admin.auth().setCustomUserClaims(uid, { role: "client" });
  }

  report.created.push({
    uid,
    email: analysis.emailLower,
    companyName: normalizeString(row.raisonSociale),
    auth: createdAuthUser ? "created_disabled" : authUser ? "existing" : "none",
    clientPath: clientRef.path,
    userPath: authUser ? userRef.path : null,
  });
}

function writeReport(report) {
  const reportDir = path.resolve(ROOT_DIR, `outputs/imports/${profile.reportDir}/reports`);
  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.resolve(reportDir, `${batchId}-${commit ? "commit" : "dry-run"}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  return reportPath;
}

initAdmin();
const db = admin.firestore();
const rows = parseCsv(sourceArg).slice(0, limit > 0 ? limit : undefined);

const report = {
  generatedAt: new Date().toISOString(),
  projectId: PROJECT_ID,
  profile: profileKey,
  mode: commit ? "commit" : "dry-run",
  source: sourceArg,
  batchId,
  options: {
    createAuthDisabled,
    limit,
    writesClientRequests: false,
    writesInvoices: false,
    sendsEmails: false,
  },
  summary: {
    scanned: 0,
    wouldImport: 0,
    imported: 0,
    skipped: 0,
    wouldCreateAuthDisabled: 0,
    createdAuthDisabled: 0,
    existingAuthUsers: 0,
    legacyIdWithoutAuth: 0,
  },
  skipped: [],
  candidates: [],
  created: [],
};

console.log(`[start] ${commit ? "COMMIT" : "DRY-RUN"} ${rows.length} row(s) from ${sourceArg}`);
console.log(`[profile] ${profileKey} center=${ADDRESS_ID} addressKey=${ADDRESS_KEY}`);
console.log(`[guard] client_requests=false invoices=false emails=false authDisabled=${createAuthDisabled}`);

const seenSourceEmails = new Set();
const seenSourceSirets = new Set();

for (const row of rows) {
  report.summary.scanned += 1;
  const sourceEmail = normalizeEmail(row.email);
  const sourceSiret = normalizeSiret(row.siret);
  const sourceDuplicateReasons = [];

  if (sourceEmail && seenSourceEmails.has(sourceEmail)) {
    sourceDuplicateReasons.push(`duplicate_email_in_source:${sourceEmail}`);
  }

  if (sourceSiret && seenSourceSirets.has(sourceSiret)) {
    sourceDuplicateReasons.push(`duplicate_siret_in_source:${sourceSiret}`);
  }

  if (sourceEmail) seenSourceEmails.add(sourceEmail);
  if (sourceSiret) seenSourceSirets.add(sourceSiret);

  if (sourceDuplicateReasons.length > 0) {
    report.summary.skipped += 1;
    report.skipped.push({
      sourceRow: row.sourceRow,
      email: sourceEmail,
      companyName: normalizeString(row.raisonSociale),
      siret: sourceSiret,
      auth: "not_checked",
      warnings: buildImportWarning(row),
      reason: sourceDuplicateReasons.join(";"),
      existingClients: [],
    });
    continue;
  }

  const analysis = await analyzeRow(db, row);
  const candidate = {
    sourceRow: row.sourceRow,
    email: analysis.emailLower,
    companyName: normalizeString(row.raisonSociale),
    siret: normalizeSiret(row.siret),
    auth: analysis.authUser ? "existing" : createAuthDisabled ? "would_create_disabled" : "none",
    warnings: buildImportWarning(row),
  };

  if (analysis.authUser) report.summary.existingAuthUsers += 1;
  if (!analysis.authUser && createAuthDisabled) report.summary.wouldCreateAuthDisabled += 1;
  if (!analysis.authUser && !createAuthDisabled) report.summary.legacyIdWithoutAuth += 1;

  if (analysis.shouldSkip) {
    report.summary.skipped += 1;
    report.skipped.push({
      ...candidate,
      reason: analysis.skipReason,
      existingClients: analysis.existingClients,
    });
    continue;
  }

  report.summary.wouldImport += 1;
  report.candidates.push(candidate);

  if (commit) {
    await commitRow(db, row, analysis, report);
    report.summary.imported += 1;
    if (!analysis.authUser && createAuthDisabled) {
      report.summary.createdAuthDisabled += 1;
    }
  }
}

const reportPath = writeReport(report);
console.log("[done] summary");
console.log(JSON.stringify(report.summary, null, 2));
console.log(`[done] report written to ${reportPath}`);
