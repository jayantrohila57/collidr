import { expect, test } from "@playwright/test";
import { hasE2eAuth } from "./helpers/auth";

const PROD = process.env.PLAYWRIGHT_BASE_URL?.includes("vercel.app") ?? false;

async function completeOnboardingIfNeeded(
  page: import("@playwright/test").Page,
) {
  const dialog = page.getByRole("dialog", {
    name: "Create your organization",
  });
  if (!(await dialog.isVisible().catch(() => false))) {
    return;
  }
  await page.getByLabel("Organization name").fill("E2E Auth QA");
  await page.getByLabel("URL slug").fill("e2e-auth-qa");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(dialog).toBeHidden({ timeout: 20_000 });
}

test.describe("auth redirects — production", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("middleware sends unauthenticated users to /sign-in with redirect", async ({
    page,
  }) => {
    test.skip(!PROD, "Production base URL required");

    const t0 = Date.now();
    const response = await page.goto("/dashboard/projects?foo=1");
    expect(response?.status()).toBeLessThan(400);
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toMatch(/\/sign-in\?/);
    expect(page.url()).toContain(
      encodeURIComponent("/dashboard/projects?foo=1"),
    );
    expect(Date.now() - t0).toBeLessThan(5000);
    await expect(page.getByTestId("sign-in-page")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue with GitHub" }),
    ).toBeVisible();
  });

  test("sign-in page at mobile width", async ({ page }) => {
    test.skip(!PROD, "Production base URL required");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/sign-in?redirect=%2Fdashboard");
    await expect(page.getByTestId("sign-in-page")).toBeVisible();
  });
});

test.describe("auth sign-in and sign-out — local e2e", () => {
  test.beforeAll(() => {
    test.skip(!hasE2eAuth(), "E2E_TEST_MODE or E2E_SESSION_COOKIE required");
    test.skip(PROD, "Use local dev for email sign-in and sign-out");
  });

  test("e2e login reaches dashboard; sign-out shows toast and returns to home", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page).not.toHaveURL(/\/sign-in/);

    await page.goto("/sign-in");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/dashboard/);
    await completeOnboardingIfNeeded(page);

    await page.getByRole("button", { name: "Open account menu" }).click();
    await page.getByRole("menuitem", { name: /log out/i }).click();
    await expect(page.getByText("Signed out")).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("marketing-sign-in")).toBeVisible();

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
