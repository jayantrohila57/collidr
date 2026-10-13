import { test } from "@playwright/test";

const VIEWPORTS = [
  { width: 375, height: 812, name: "375" },
  { width: 768, height: 1024, name: "768" },
  { width: 1280, height: 800, name: "1280" },
] as const;

const AUTH_ROUTES = [
  "/dashboard",
  "/dashboard/projects",
  "/dashboard/activity",
  "/dashboard/settings",
] as const;

const PUBLIC_ROUTES = ["/"] as const;

const hasAuth = Boolean(process.env.E2E_SESSION_COOKIE?.trim());
const shotDir = process.env.SPACING_SHOT_DIR ?? "spacing-shots";

for (const viewport of VIEWPORTS) {
  for (const route of PUBLIC_ROUTES) {
    test(`spacing ${route} ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const slug = route === "/" ? "home" : route.replace(/\//g, "_");
      await page.screenshot({
        path: `${shotDir}/${slug}-${viewport.name}.png`,
        fullPage: true,
      });
    });
  }

  for (const route of AUTH_ROUTES) {
    test(`spacing ${route} ${viewport.name} auth`, async ({ page }) => {
      test.skip(
        !hasAuth,
        "Set E2E_SESSION_COOKIE for authenticated spacing shots",
      );
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const slug = route.replace(/\//g, "_");
      await page.screenshot({
        path: `${shotDir}/${slug}-${viewport.name}.png`,
        fullPage: true,
      });
    });
  }
}
