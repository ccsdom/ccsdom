const { test, expect } = require("@playwright/test");

const BASE_URL = process.env.CCS_TEST_BASE_URL || "https://ccsdom.fr";
const EMAIL = process.env.CCS_TEST_EMAIL || "";
const PASSWORD = process.env.CCS_TEST_PASSWORD || "";
const TARGET_CENTER = process.env.CCS_TEST_CENTER || "CCS - Orly Ville";

function parseFirstInteger(value) {
  const match = String(value ?? "").match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : null;
}

function parseActiveClients(rowText) {
  const match = String(rowText).match(/(\d+)\s*\/\s*\d+/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function computeQuotaToTest(activeClients, originalQuota) {
  if (typeof activeClients !== "number" || Number.isNaN(activeClients)) {
    return originalQuota && originalQuota > 0 ? originalQuota + 1 : 1;
  }

  if (activeClients > 1) {
    const candidate = activeClients - 1;
    if (candidate !== originalQuota) return candidate;
    return activeClients;
  }

  if (activeClients === 1) {
    if (originalQuota !== 1) return 1;
    return 2;
  }

  if (originalQuota !== 1) return 1;
  return 2;
}

async function openCenterGovernanceDialog(page, centerName) {
  const row = page.getByRole("row").filter({ hasText: centerName });
  await expect(row).toBeVisible({ timeout: 30000 });
  await row.click();
  const button = page.getByRole("button", { name: "Mettre a jour la gouvernance" });
  await expect(button).toBeVisible({ timeout: 30000 });
  await button.click();
  await expect(page.getByText("Pilotage du centre")).toBeVisible({ timeout: 30000 });
}

async function saveGovernanceDialog(page) {
  await page.getByRole("button", { name: "Enregistrer la gouvernance" }).click();
  await expect(page.getByText("Pilotage du centre")).toBeHidden({ timeout: 30000 });
}

test.describe("super admin billing smoke", () => {
  test.skip(!EMAIL || !PASSWORD, "CCS_TEST_EMAIL and CCS_TEST_PASSWORD are required");

  test("validates super admin billing and governance sync", async ({ page }) => {
    test.setTimeout(180000);
    let originalQuotaRaw = "";
    let updatedQuotaRaw = "";
    let shouldRestoreQuota = false;

    try {
      await page.addInitScript(() => {
        window.localStorage.setItem("cookie_consent", "accepted");
      });
      await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
      await expect(page.getByText("Espace Client")).toBeVisible({ timeout: 30000 });

      await page.locator('input[type="email"]').fill(EMAIL);
      await page.locator('input[type="password"]').fill(PASSWORD);
      await Promise.all([
        page.waitForURL(/\/admin(?:$|[/?#])/, { timeout: 60000 }),
        page.getByRole("button", { name: /Se Connecter/i }).click(),
      ]);

      await page.goto(`${BASE_URL}/admin/billing`, { waitUntil: "networkidle" });
      await expect(page.getByText("Gouvernance reseau")).toBeVisible({ timeout: 30000 });
      await expect(page.getByText("Facturation")).toBeVisible({ timeout: 30000 });
      await expect(page.getByText("Contrats centres configures")).toBeVisible({ timeout: 30000 });
      await expect(page.getByText("Vigie reseau")).toBeVisible({ timeout: 30000 });

      const billingRow = page.getByRole("row").filter({ hasText: TARGET_CENTER });
      await expect(billingRow).toBeVisible({ timeout: 30000 });
      const billingRowText = await billingRow.innerText();
      const activeClients = parseActiveClients(billingRowText);

      await page.evaluate(() => {
        sessionStorage.setItem(
          "simulated-role-storage",
          JSON.stringify({ state: { simulatedRole: "manager_orly" }, version: 1 })
        );
      });
      await page.goto(`${BASE_URL}/admin/billing`, { waitUntil: "networkidle" });
      await expect(page.getByText("Historique de Facturation")).toBeVisible({ timeout: 30000 });
      await expect(page.getByText("Gouvernance reseau")).toHaveCount(0);

      await page.evaluate(() => sessionStorage.removeItem("simulated-role-storage"));
      await page.goto(`${BASE_URL}/admin/billing`, { waitUntil: "networkidle" });
      await expect(page.getByText("Gouvernance reseau")).toBeVisible({ timeout: 30000 });

      await page.goto(`${BASE_URL}/admin/adresses`, { waitUntil: "networkidle" });
      await expect(page.getByText(/Reseau CCS DOM|Réseau CCS DOM/)).toBeVisible({ timeout: 30000 });

      await openCenterGovernanceDialog(page, TARGET_CENTER);
      const quotaInput = page.locator("#quota-clients");
      await expect(quotaInput).toBeVisible({ timeout: 30000 });

      originalQuotaRaw = await quotaInput.inputValue();
      const originalQuota = parseFirstInteger(originalQuotaRaw);
      const nextQuota = computeQuotaToTest(activeClients, originalQuota);
      updatedQuotaRaw = String(nextQuota);
      shouldRestoreQuota = originalQuotaRaw !== updatedQuotaRaw;

      if (shouldRestoreQuota) {
        await quotaInput.fill(updatedQuotaRaw);
        await saveGovernanceDialog(page);
      } else {
        await page.keyboard.press("Escape");
        await expect(page.getByText("Pilotage du centre")).toBeHidden({ timeout: 30000 });
      }

      await page.goto(`${BASE_URL}/admin/billing`, { waitUntil: "networkidle" });
      const refreshedRow = page.getByRole("row").filter({ hasText: TARGET_CENTER });
      await expect(refreshedRow).toBeVisible({ timeout: 30000 });
      await expect(refreshedRow.getByText(`Quota ${updatedQuotaRaw}`)).toBeVisible({ timeout: 30000 });

      if (typeof activeClients === "number" && activeClients >= Number.parseInt(updatedQuotaRaw, 10)) {
        await expect(refreshedRow.getByText(/Quota atteint|Quota sous tension/)).toBeVisible({ timeout: 30000 });
      }
    } finally {
      if (shouldRestoreQuota) {
        await page.goto(`${BASE_URL}/admin/adresses`, { waitUntil: "networkidle" });
        await openCenterGovernanceDialog(page, TARGET_CENTER);
        const quotaInput = page.locator("#quota-clients");
        await quotaInput.fill(originalQuotaRaw);
        await saveGovernanceDialog(page);

        await page.goto(`${BASE_URL}/admin/billing`, { waitUntil: "networkidle" });
        const restoredRow = page.getByRole("row").filter({ hasText: TARGET_CENTER });
        await expect(restoredRow).toBeVisible({ timeout: 30000 });
        if (originalQuotaRaw) {
          await expect(restoredRow.getByText(`Quota ${originalQuotaRaw}`)).toBeVisible({ timeout: 30000 });
        }
      }

      if (!page.isClosed()) {
        await page.evaluate(() => sessionStorage.removeItem("simulated-role-storage"));
      }
    }
  });
});
