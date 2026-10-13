import { expect, test } from "@playwright/test";
import { hasE2eAuth } from "./helpers/auth";
import {
  assertNoHorizontalOverflow,
  assertNoVerticalPageScroll,
} from "./helpers/layout";

const ARTIFACT_DIR =
  process.env.REQUIREMENTS_AUDIT_DIR ??
  "/opt/cursor/artifacts/screenshots/requirements-audit";

const VIEWPORTS = [
  { width: 1280, height: 800, name: "1280" },
  { width: 768, height: 1024, name: "768" },
  { width: 375, height: 812, name: "375" },
] as const;

const AUTH_ROUTES = [
  { path: "/dashboard", slug: "dashboard" },
  { path: "/dashboard/projects", slug: "projects" },
  { path: "/dashboard/activity", slug: "activity" },
  { path: "/dashboard/settings", slug: "settings" },
  { path: "/dashboard/settings/organization", slug: "org-settings" },
] as const;

async function shot(page: import("@playwright/test").Page, name: string) {
  await page.screenshot({
    path: `${ARTIFACT_DIR}/${name}.png`,
    fullPage: false,
  });
}

test.describe("requirements audit — public", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const viewport of VIEWPORTS) {
    test(`landing split @ ${viewport.name}px`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");
      await expect(page.getByTestId("marketing-sign-in")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Continue with GitHub" }),
      ).toBeVisible();
      await assertNoHorizontalOverflow(page);
      if (viewport.name === "1280") {
        await assertNoVerticalPageScroll(page);
      }
      await shot(page, `01-landing-${viewport.name}`);
    });
  }
});

test.describe("requirements audit — authenticated", () => {
  test.beforeAll(() => {
    test.skip(!hasE2eAuth(), "E2E_TEST_MODE or E2E_SESSION_COOKIE required");
  });

  for (const viewport of VIEWPORTS) {
    for (const route of AUTH_ROUTES) {
      test(`${route.slug} @ ${viewport.name}px`, async ({ page }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await page.goto(route.path);
        await page.waitForLoadState("domcontentloaded");
        await expect(page).not.toHaveURL(/\/$/);
        await expect(page.locator("#main-content")).toBeVisible();
        await assertNoHorizontalOverflow(page);
        await shot(page, `02-${route.slug}-${viewport.name}`);
      });
    }

    test(`project detail @ ${viewport.name}px`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("/dashboard/projects/e2e-demo-project");
      await page.waitForLoadState("domcontentloaded");
      await expect(
        page.getByRole("heading", { name: "E2E Demo Project" }),
      ).toBeVisible({ timeout: 20_000 });
      await assertNoHorizontalOverflow(page);
      await shot(page, `03-project-detail-${viewport.name}`);
    });

    test(`404 in shell @ ${viewport.name}px`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("/dashboard/this-route-does-not-exist-404");
      await page.waitForLoadState("domcontentloaded");
      await expect(
        page.getByRole("heading", { name: "Not found" }),
      ).toBeVisible();
      await expect(
        page
          .locator("#main-content")
          .getByRole("button", { name: "Toggle Sidebar" }),
      ).toBeVisible();
      await shot(page, `04-not-found-shell-${viewport.name}`);
    });
  }

  test("mobile sidebar closes on one Escape @ 375", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    const mobileSidebar = page.locator(
      '[data-mobile="true"][data-slot="sidebar"]',
    );
    await expect(mobileSidebar).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(mobileSidebar).toBeHidden({ timeout: 5000 });
    await shot(page, "05-mobile-sidebar-escape-375");
  });
});
