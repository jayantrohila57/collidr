import { expect, test } from "@playwright/test";

const hasAuth = Boolean(process.env.E2E_SESSION_COOKIE?.trim());
const prodBase =
  process.env.PLAYWRIGHT_BASE_URL?.includes("vercel.app") ?? false;

test.describe("mobile sidebar", () => {
  test("closes on a single Escape press", async ({ page }) => {
    test.skip(
      !hasAuth,
      "Set E2E_SESSION_COOKIE to run authenticated mobile sidebar tests",
    );

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    const sidebarTrigger = page.getByRole("button", { name: "Toggle Sidebar" });
    await expect(sidebarTrigger).toBeVisible();
    await sidebarTrigger.click();

    const mobileSidebar = page.locator(
      '[data-mobile="true"][data-slot="sidebar"]',
    );
    await expect(mobileSidebar).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(mobileSidebar).toBeHidden({ timeout: 5000 });
  });
});

test.describe("landing prod smoke", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("home hero at mobile width", async ({ page }) => {
    test.skip(
      !prodBase,
      "Set PLAYWRIGHT_BASE_URL to production for prod smoke",
    );

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByTestId("marketing-hero")).toBeVisible();
  });
});
