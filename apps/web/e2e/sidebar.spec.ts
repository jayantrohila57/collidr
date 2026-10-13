import { mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { hasE2eAuth } from "./helpers/auth";

const ARTIFACT_DIR =
  process.env.SIDEBAR_SCREENSHOT_DIR ?? "test-results/screenshots/sidebar";

test.describe("app sidebar", () => {
  test.beforeAll(() => {
    test.skip(!hasE2eAuth(), "E2E_TEST_MODE or E2E_SESSION_COOKIE required");
  });

  test("sidebar expanded, icon collapsed, and mobile sheet", async ({
    page,
  }) => {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/dashboard/projects");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("link", { name: "Projects", exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("Organizations", { exact: true }),
    ).not.toBeVisible();
    const header = page.locator('[data-slot="sidebar-header"]');
    const footer = page.locator('[data-slot="sidebar-footer"]');
    await expect(footer.getByRole("link", { name: "Settings" })).toBeVisible();
    await expect(
      page.locator('[data-slot="sidebar"]').getByRole("link", {
        name: "Settings",
      }),
    ).toHaveCount(1);
    await expect(
      page
        .locator('[data-slot="collapsible-trigger"]')
        .filter({ hasText: "Projects" }),
    ).toBeVisible();
    await expect(
      footer.getByRole("button", { name: "Switch organization" }),
    ).toHaveCount(0);
    const orgSwitcher = header.getByRole("button", {
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
    await expect(
      page.locator('[data-slot="sidebar-footer"]').getByRole("button", {
        name: "Switch organization",
      }),
    ).toHaveCount(0);
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
    const mobileFooter = page.locator('[data-slot="sidebar-footer"]');
    await expect(
      mobileFooter.getByRole("button", { name: "Switch organization" }),
    ).toHaveCount(0);
    const mobileHeader = page.locator('[data-slot="sidebar-header"]');
    const mobileOrg = mobileHeader.getByRole("button", {
      name: "Switch organization",
    });
    if (await mobileOrg.count()) {
      await expect(mobileOrg).toBeVisible();
    }
    await expect(
      page.getByText("Organizations", { exact: true }),
    ).not.toBeVisible();
    await page.screenshot({
      path: `${ARTIFACT_DIR}/sidebar-mobile-sheet.png`,
      fullPage: false,
    });
  });
});
