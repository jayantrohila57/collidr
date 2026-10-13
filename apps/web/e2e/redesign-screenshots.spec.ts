import { test } from "@playwright/test";

const VIEWPORTS = [
  { width: 375, height: 812, name: "375" },
  { width: 768, height: 1024, name: "768" },
  { width: 1280, height: 800, name: "1280" },
] as const;

const PUBLIC_ROUTES = ["/"] as const;

const shotDir =
  process.env.REDESIGN_SHOT_DIR ?? "../../artifacts/screenshots/redesign-after";

for (const viewport of VIEWPORTS) {
  for (const route of PUBLIC_ROUTES) {
    test(`redesign after ${route} @ ${viewport.name}px`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: `${shotDir}/home-${viewport.name}.png`,
        fullPage: true,
      });
    });
  }
}
