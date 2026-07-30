import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

function pushCheck(results, name, ok, details) {
  results.push({ name, ok, details });
}

function extractMatchBlock(source, collectionName) {
  const startToken = `match /${collectionName}`;
  const start = source.indexOf(startToken);
  if (start < 0) return "";

  const lineEnd = source.indexOf("\n", start);
  const blockStart = source.lastIndexOf("{", lineEnd < 0 ? source.length : lineEnd);
  if (blockStart < 0) return "";

  let depth = 0;
  for (let index = blockStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }

  return "";
}

function ensureContainsAll(text, fragments) {
  return fragments.filter((fragment) => !text.includes(fragment));
}

function main() {
  const results = [];
  const firestoreRules = readText("firestore.rules");
  const storageRules = readText("storage.rules");
  const adminDocumentsPage = readText("src/app/admin/documents/page.tsx");
  const adminClientsPage = readText("src/app/admin/clients/page.tsx");
  const adminValidationPage = readText("src/app/admin/validation/page.tsx");
  const adminMailsPage = readText("src/app/admin/mails/page.tsx");
  const adminBillingPage = readText("src/app/admin/billing/page.tsx");
  const adminNotificationsPage = readText("src/app/admin/notifications/page.tsx");
  const adminActivityPage = readText("src/app/admin/activity/page.tsx");
  const adminScanPage = readText("src/app/admin/scan/page.tsx");

  const clientRequestsBlock = extractMatchBlock(firestoreRules, "client_requests");
  const clientsBlock = extractMatchBlock(firestoreRules, "clients");

  pushCheck(
    results,
    "client_requests list scoped by center",
    clientRequestsBlock.includes("allow list: if isStaff() && isStaffOf(resource.data);"),
    "client_requests list must not be broadly readable by all staff."
  );

  pushCheck(
    results,
    "clients list scoped by center",
    clientsBlock.includes("allow list: if isStaff() && isStaffOf(resource.data);"),
    "clients list must not be broadly readable by all staff."
  );

  const broadSensitiveRules = [
    "allow list: if isStaff(); // Broad list for staff",
    "allow list: if isStaff();",
  ].filter((fragment) => clientRequestsBlock.includes(fragment) || clientsBlock.includes(fragment));

  pushCheck(
    results,
    "no broad staff list on critical collections",
    broadSensitiveRules.length === 0,
    broadSensitiveRules.length === 0
      ? "No broad list rule detected for clients/client_requests."
      : `Broad fragments detected: ${broadSensitiveRules.join(", ")}`
  );

  const missingDocumentsScope = ensureContainsAll(adminDocumentsPage, [
    "const centerFieldFilters = managedCenterIds",
    'where("centerId", "==", centerId)',
    'where("addressKey", "==", legacyKey)',
    "query(collection(db, \"clients\"), filterConstraint)",
    "canAccessCenter(displayRole, managedCenterIds, resolveRecordCenterId(client as any))",
  ]);

  pushCheck(
    results,
    "formalities clients query scoped",
    missingDocumentsScope.length === 0,
    missingDocumentsScope.length === 0
      ? "Admin documents page queries clients through center-scoped filters."
      : `Missing fragments: ${missingDocumentsScope.join(", ")}`
  );

  const pageScopeChecks = [
    {
      name: "clients page uses center filters",
      source: adminClientsPage,
      fragments: [
        "const scopedAddressId",
        "where('domiciliationAddressId', '==', scopedAddressId)",
        "where('addressId', '==', scopedAddressId)",
        "managedCenterIds.includes('paris_12e')",
        "managedCenterIds.includes('orly_ville')",
      ],
    },
    {
      name: "validation page uses addressKey scope",
      source: adminValidationPage,
      fragments: [
        "const scopedAddressKeys = managedCenterIds",
        'where("addressKey", "==", scopedAddressKeys[0])',
      ],
    },
    {
      name: "mails page uses centerKey/addressKey scope",
      source: adminMailsPage,
      fragments: [
        "const scopedCenterKeys = useMemo",
        'where("centerKey", "==", scopedCenterKeys[0])',
        'where("addressKey", "==", scopedAddressKeys[0])',
      ],
    },
    {
      name: "billing page uses addressKey scope",
      source: adminBillingPage,
      fragments: [
        "const scopedAddressKeys = managedCenterIds",
        'where("addressKey", "==", scopedAddressKeys[0])',
      ],
    },
    {
      name: "scan page queries clients by center",
      source: adminScanPage,
      fragments: [
        "const queryByLabel = new Map",
        'where("centerId", "==", centerId)',
        'where("addressKey", "==", centerKey)',
        "canSeeClientForRole(client, displayRole, scopedCenterIds)",
      ],
    },
    {
      name: "notifications page uses center scope",
      source: adminNotificationsPage,
      fragments: [
        "buildActivityCenterFilters(managedCenterIds)",
        "buildSharedActivityCenterFilters(centerIds)",
        "actualRole === \"super_admin\"",
      ],    },
    {
      name: "activity page uses compatible center scope",
      source: adminActivityPage,
      fragments: [
        "function buildActivityCenterFilters",
        "buildSharedActivityCenterFilters(centerIds)",
        "const centerFilters = buildActivityCenterFilters(actualManagedCenterIds)",
        "return query(base, or(...centerFilters), limit(300))",
      ],
    },
  ];

  for (const check of pageScopeChecks) {
    const missing = ensureContainsAll(check.source, check.fragments);
    pushCheck(
      results,
      check.name,
      missing.length === 0,
      missing.length === 0 ? "Scoped query fragments present." : `Missing fragments: ${missing.join(", ")}`
    );
  }

  const missingStoragePdfScope = ensureContainsAll(storageRules, [
    "match /attestations-paris/{fileName}",
    "allow read: if (isStaff() && isStaffOf('paris')) || isOwnerOfRequest('pdf_requests_attestations_paris'",
    "match /attestations-orly/{fileName}",
    "allow read: if (isStaff() && isStaffOf('orly')) || isOwnerOfRequest('pdf_requests_attestations_orly'",
    "match /contrats-paris/{fileName}",
    "allow read: if (isStaff() && isStaffOf('paris'))",
    "match /contrats-orly/{fileName}",
    "allow read: if (isStaff() && isStaffOf('orly')) || isOwnerOfRequest('pdf_requests_contrats_orly'",
    "allow read: if (isStaff() && isStaffOf('paris')) || isOwnerOfRequest('pdf_requests_invoices_paris'",
    "allow read: if (isStaff() && isStaffOf('orly')) || isOwnerOfRequest('pdf_requests_invoices_orly'",
  ]);

  pushCheck(
    results,
    "storage generated pdfs scoped by center",
    missingStoragePdfScope.length === 0,
    missingStoragePdfScope.length === 0
      ? "Contracts, attestations and invoices are center-scoped in Storage rules."
      : `Missing fragments: ${missingStoragePdfScope.join(", ")}`
  );

  const broadGeneratedPdfReads = [
    "allow read: if isStaff() || isOwnerOfRequest('pdf_requests_attestations",
    "allow read: if isStaff() || isOwnerOfRequest('pdf_requests_contrats",
    "allow read: if isStaff() ",
  ].filter((fragment) => storageRules.includes(fragment));

  pushCheck(
    results,
    "no broad staff read on generated pdfs",
    broadGeneratedPdfReads.length === 0,
    broadGeneratedPdfReads.length === 0
      ? "No broad generated PDF read rule detected."
      : `Broad fragments detected: ${broadGeneratedPdfReads.join(", ")}`
  );

  const failures = results.filter((result) => !result.ok);

  console.log("");
  console.log("QA multi-tenant isolation");
  console.log("=========================");
  for (const result of results) {
    console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name}`);
    console.log(`      ${result.details}`);
  }
  console.log("");
  console.log(`Total checks: ${results.length}`);
  console.log(`Failures: ${failures.length}`);

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main();
