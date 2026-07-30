import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(rootDir, relativePath));
}

function extractEnvValue(yaml, variableName) {
  const pattern = new RegExp(
    `-\\s+variable:\\s+${variableName}\\s*\\n(?:\\s+[^\\n]*\\n)*?\\s+value:\\s+([^\\n]+)`,
    "m"
  );
  const match = yaml.match(pattern);
  return match?.[1]?.trim().replace(/^['"]|['"]$/g, "") ?? null;
}

function hasSecret(yaml, variableName) {
  const pattern = new RegExp(
    `-\\s+variable:\\s+${variableName}\\s*\\n(?:\\s+[^\\n]*\\n)*?\\s+secret:\\s+${variableName}`,
    "m"
  );
  return pattern.test(yaml);
}

function extractMaxInstances(yaml) {
  const match = yaml.match(/maxInstances:\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

function isTrackedByGit(relativePath) {
  try {
    const output = execSync(`git ls-files -- ${relativePath}`, {
      cwd: rootDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .includes(relativePath);
  } catch {
    return false;
  }
}

function push(results, severity, name, ok, details) {
  results.push({ severity, name, ok, details });
}

function main() {
  const results = [];
  const apphosting = readText("apphosting.yaml");
  const gitignore = readText(".gitignore");
  const loginPage = readText("src/app/login/page.tsx");
  const settingsPage = readText("src/app/dashboard/settings/page.tsx");

  const appUrl = extractEnvValue(apphosting, "NEXT_PUBLIC_APP_URL");
  push(
    results,
    "fail",
    "canonical app url",
    appUrl === "https://ccsdom.fr",
    appUrl
      ? `NEXT_PUBLIC_APP_URL=${appUrl}`
      : "NEXT_PUBLIC_APP_URL is missing from apphosting.yaml"
  );

  push(
    results,
    "fail",
    "no hosted.app public callbacks",
    !String(appUrl || "").includes("hosted.app"),
    "Public callbacks must use the ccsdom.fr domain."
  );

  const stripeKey = extractEnvValue(apphosting, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  push(
    results,
    "fail",
    "stripe publishable key mode",
    Boolean(stripeKey?.startsWith("pk_live_")),
    stripeKey?.startsWith("pk_test_")
      ? "A test Stripe publishable key is configured. Use a live key before real billing."
      : "A live Stripe publishable key is expected for production billing."
  );

  for (const secretName of [
    "GEMINI_API_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "RESEND_API_KEY",
  ]) {
    push(
      results,
      "fail",
      `secret ${secretName}`,
      hasSecret(apphosting, secretName),
      `${secretName} must be provided through Firebase/App Hosting secrets.`
    );
  }

  const appCheckKey = extractEnvValue(apphosting, "NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY");
  push(
    results,
    "warn",
    "firebase app check key",
    Boolean(appCheckKey && !appCheckKey.includes("REMPLACE_MOI")),
    "NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY is not configured in apphosting.yaml."
  );

  const maxInstances = extractMaxInstances(apphosting);
  push(
    results,
    "warn",
    "app hosting capacity",
    typeof maxInstances === "number" && maxInstances > 1,
    `maxInstances=${maxInstances ?? "missing"}. This is safe for costs, but fragile for production peaks.`
  );

  push(
    results,
    "fail",
    "service account ignored",
    gitignore.includes("serviceAccountKey.json"),
    "serviceAccountKey.json must never be committed."
  );

  push(
    results,
    "fail",
    "service account untracked",
    !isTrackedByGit("serviceAccountKey.json"),
    isTrackedByGit("serviceAccountKey.json")
      ? "serviceAccountKey.json is still tracked by Git. Run: git rm --cached serviceAccountKey.json"
      : "serviceAccountKey.json is not tracked by Git."
  );

  push(
    results,
    "fail",
    "custom auth action page",
    fileExists("src/app/auth/action/page.tsx") &&
      fileExists("src/app/auth/action/reset-password-client.tsx"),
    "The custom /auth/action route is required for branded Firebase Auth links."
  );

  push(
    results,
    "warn",
    "firebase auth action url",
    false,
    "Manual console check required: Firebase Auth templates must point to https://ccsdom.fr/auth/action."
  );

  push(
    results,
    "fail",
    "password reset ccsdom fallback",
    loginPage.includes("https://ccsdom.fr") && settingsPage.includes("https://ccsdom.fr"),
    "Password reset calls should fallback to the canonical production domain."
  );

  const failures = results.filter((item) => item.severity === "fail" && !item.ok);
  const warnings = results.filter((item) => item.severity === "warn" && !item.ok);

  console.log("");
  console.log("Production readiness");
  console.log("====================");
  for (const item of results) {
    const status = item.ok ? "PASS" : item.severity === "warn" ? "WARN" : "FAIL";
    console.log(`${status}  ${item.name}`);
    console.log(`      ${item.details}`);
  }
  console.log("");
  console.log(`Failures: ${failures.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main();
