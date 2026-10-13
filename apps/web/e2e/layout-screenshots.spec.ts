import { expect, test } from "@playwright/test";
import { assertNoHorizontalOverflow } from "./helpers/layout";

const VIEWPORTS = [
  { width: 375, height: 812, name: "375" },
  { width: 768, height: 1024, name: "768" },
  { width: 1280, height: 800, name: "1280" },
] as const;

const PUBLIC_ROUTES = ["/", "/dashboard"] as const;

for (const viewport of VIEWPORTS) {
  for (const route of PUBLIC_ROUTES) {
    test(`public layout ${route} at ${viewport.name}px`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await assertNoHorizontalOverflow(page);
      if (route === "/") {
        await expect(page).toHaveScreenshot(
          `public-home-${viewport.name}.png`,
          { maxDiffPixelRatio: 0.03 },
        );
      }
    });
  }
}
