import { test } from "@playwright/test";
import { hasE2eAuth } from "./helpers/auth";

const VIEWPORTS = [
  { width: 375, height: 812, name: "375" },
  { width: 1280, height: 800, name: "1280" },
] as const;

const ROUTES = [
  { path: "/dashboard", name: "dashboard" },
  { path: "/dashboard/projects", name: "projects" },
  { path: "/dashboard/settings", name: "user-settings" },
  { path: "/dashboard/settings/organization", name: "org-settings" },
] as const;

const hasAuth = hasE2eAuth();
const shotDir =
  process.env.PROD_DESIGN_SHOT_DIR ??
  "../../artifacts/screenshots/prod-design-review";

for (const viewport of VIEWPORTS) {
  for (const route of ROUTES) {
    test(`prod design ${route.name} @ ${viewport.name}px`, async ({ page }) => {
      test.skip(!hasAuth, "Set E2E_SESSION_COOKIE for authenticated shots");
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: `${shotDir}/${route.name}-${viewport.name}.png`,
        fullPage: true,
      });
    });
  }

  test(`prod design project-detail @ ${viewport.name}px`, async ({ page }) => {
    test.skip(!hasAuth, "Set E2E_SESSION_COOKIE for authenticated shots");
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/dashboard/projects");
    await page.waitForLoadState("networkidle");
    const firstProject = page.getByRole("link", { name: /./ }).first();
    if (await firstProject.isVisible().catch(() => false)) {
      await firstProject.click();
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: `${shotDir}/project-detail-${viewport.name}.png`,
        fullPage: true,
      });
    }
  });
}
