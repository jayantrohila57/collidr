import { expect, test } from "@playwright/test";
import { hasE2eAuth } from "./helpers/auth";

const ARTIFACT_DIR =
  process.env.SIDEBAR_SCREENSHOT_DIR ??
  "/opt/cursor/artifacts/screenshots/sidebar";

test.describe("app sidebar", () => {
  test.beforeAll(() => {
    test.skip(!hasE2eAuth(), "E2E_TEST_MODE or E2E_SESSION_COOKIE required");
  });

  test("sidebar expanded, icon collapsed, and mobile sheet", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/dashboard/projects");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("link", { name: "View all projects" }),
    ).toBeVisible();
    await expect(
      page.getByText("Organizations", { exact: true }),
    ).not.toBeVisible();
    const footer = page.locator('[data-slot="sidebar-footer"]');
    await expect(footer.getByRole("link", { name: "Settings" })).toBeVisible();
    const orgSwitcher = footer.getByRole("button", {
      name: "Switch organization",
    });
    if (await orgSwitcher.count()) {
      await expect(orgSwitcher).toBeVisible();
    }
    await page.screenshot({
      path: `${ARTIFACT_DIR}/sidebar-desktop-expanded.png`,
      fullPage: false,
    });

    await page
      .locator("#main-content")
      .getByRole("button", { name: "Toggle Sidebar" })
      .click();
    await page.waitForTimeout(400);
    await expect(
      page.locator('[data-slot="sidebar-footer"]').getByRole("link", {
        name: "Settings",
      }),
    ).toBeVisible();
    await page.screenshot({
      path: `${ARTIFACT_DIR}/sidebar-desktop-icon-collapsed.png`,
      fullPage: false,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard/projects");
    await page.waitForLoadState("networkidle");
    await page
      .locator("#main-content")
      .getByRole("button", { name: "Toggle Sidebar" })
      .click();
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
    await expect(
      page.getByText("Organizations", { exact: true }),
    ).not.toBeVisible();
    await page.screenshot({
      path: `${ARTIFACT_DIR}/sidebar-mobile-sheet.png`,
      fullPage: false,
    });
  });
});
