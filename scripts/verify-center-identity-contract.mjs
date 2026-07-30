import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

function pushCheck(results, name, ok, details) {
  results.push({ name, ok, details });
}

function ensureContainsAll(text, fragments) {
  return fragments.filter((fragment) => !text.includes(fragment));
}

function main() {
  const results = [];

  const contractDoc = readText("docs/center-identity-contract.md");
  const frontendAccess = readText("src/lib/access-control.ts");
  const functionsAuth = readText("functions/src/_utils/auth.ts");
  const setRole = readText("functions/src/callable/roles/setRole.ts");
  const clientsPage = readText("src/app/admin/clients/page.tsx");
  const signupService = readText("src/services/signup-service.ts");
  const finalizeSignup = readText("functions/src/finalizeSignup.ts");
  const firestoreRules = readText("firestore.rules");
  const storageRules = readText("storage.rules");
  const backfillScript = readText("functions/scripts/backfill-client-requests-center.ts");

  const missingContractDoc = ensureContainsAll(contractDoc, [
    "`centerId` est l'identifiant metier canonique",
    "addressKey",
    "locationKey",
    "centerKey",
    "npm run qa:multitenant",
  ]);
  pushCheck(
    results,
    "center contract documentation",
    missingContractDoc.length === 0,
    missingContractDoc.length === 0
      ? "Contract document covers canonical and legacy fields."
      : `Missing fragments: ${missingContractDoc.join(", ")}`
  );

  for (const [name, source] of [
    ["frontend access-control", frontendAccess],
    ["functions auth access-control", functionsAuth],
  ]) {
    const missing = ensureContainsAll(source, [
      'if (centerId === "paris") return "paris_12e";',
      'if (centerId === "orly") return "orly_ville";',
      'if (role === "manager_paris" || role === "secretary_paris") return "paris_12e";',
      'if (role === "manager_orly" || role === "secretary_orly") return "orly_ville";',
    ]);
    pushCheck(
      results,
      `${name} normalizes historical centers`,
      missing.length === 0,
      missing.length === 0 ? "Paris/Orly normalization is aligned." : `Missing fragments: ${missing.join(", ")}`
    );
  }

  const missingDirectCreation = ensureContainsAll(clientsPage, [
    "centerId: addressId",
    "addressId",
    "domiciliationAddressId",
    "addressKey: addressKeyForAddressId(addressId)",
    "locationKey: addressKeyForAddressId(addressId)",
  ]);
  pushCheck(
    results,
    "manager direct client creation writes center identity",
    missingDirectCreation.length === 0,
    missingDirectCreation.length === 0
      ? "Direct client creation writes canonical and compatibility fields."
      : `Missing fragments: ${missingDirectCreation.join(", ")}`
  );

  const missingSetRoleCreation = ensureContainsAll(setRole, [
    "centerId: resolvedAddressId",
    "addressId: resolvedAddressId",
    "addressKey: resolvedAddressKey",
    "locationKey: resolvedAddressKey",
  ]);
  pushCheck(
    results,
    "callable client creation writes center identity",
    missingSetRoleCreation.length === 0,
    missingSetRoleCreation.length === 0
      ? "Callable provisioning writes canonical and compatibility fields."
      : `Missing fragments: ${missingSetRoleCreation.join(", ")}`
  );

  const missingSignupCreation = ensureContainsAll(signupService, [
    "const addressId = String(data.addressId ?? \"\")",
    "centerId: addressId",
    "addressId",
    "addressKey",
    "locationKey: addressKey",
  ]);
  pushCheck(
    results,
    "public signup writes center compatibility fields",
    missingSignupCreation.length === 0,
    missingSignupCreation.length === 0
      ? "Public signup preserves center compatibility fields."
      : `Missing fragments: ${missingSignupCreation.join(", ")}`
  );

  const missingFinalizeCreation = ensureContainsAll(finalizeSignup, [
    "addressId: String(formData.addressId ?? requestData.addressId ?? \"\")",
    "addressKey",
    "locationKey: addressKey",
  ]);
  pushCheck(
    results,
    "finalize signup preserves center identity",
    missingFinalizeCreation.length === 0,
    missingFinalizeCreation.length === 0
      ? "Finalize signup keeps center fields aligned."
      : `Missing fragments: ${missingFinalizeCreation.join(", ")}`
  );

  const missingRulesScope = ensureContainsAll(firestoreRules, [
    "data.get('centerId'",
    "data.get('domiciliationAddressId'",
    "data.get('locationKey'",
    "data.get('addressKey'",
    "data.get('addressId'",
    "data.get('centerKey'",
    "allow list: if isStaff() && isStaffOf(resource.data);",
  ]);
  pushCheck(
    results,
    "firestore rules understand canonical and legacy fields",
    missingRulesScope.length === 0,
    missingRulesScope.length === 0
      ? "Firestore rules evaluate center identity from all accepted fields."
      : `Missing fragments: ${missingRulesScope.join(", ")}`
  );

  const missingStorageScope = ensureContainsAll(storageRules, [
    "isStaffOf('paris')",
    "isStaffOf('orly')",
    "isOwnerOfRequest",
  ]);
  pushCheck(
    results,
    "storage rules scope generated assets",
    missingStorageScope.length === 0,
    missingStorageScope.length === 0
      ? "Storage generated assets are center-aware."
      : `Missing fragments: ${missingStorageScope.join(", ")}`
  );

  const missingBackfill = ensureContainsAll(backfillScript, [
    "--dry-run",
    "--only-missing",
    "centerId: inferredCenterId",
    "centerKey: inferredCenterKey",
    "__backfillCenter",
    "totalUndeducible",
  ]);
  pushCheck(
    results,
    "center backfill supports safe migration",
    missingBackfill.length === 0,
    missingBackfill.length === 0
      ? "Backfill script supports dry-run, only-missing and audit metadata."
      : `Missing fragments: ${missingBackfill.join(", ")}`
  );

  const failures = results.filter((result) => !result.ok);

  console.log("");
  console.log("QA center identity contract");
  console.log("===========================");
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
