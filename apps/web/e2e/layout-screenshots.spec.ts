import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { width: 375, height: 812, name: "375" },
  { width: 768, height: 1024, name: "768" },
  { width: 1280, height: 800, name: "desktop" },
] as const;

const PUBLIC_ROUTES = ["/"] as const;

for (const viewport of VIEWPORTS) {
  for (const route of PUBLIC_ROUTES) {
    test(`layout screenshot ${route} at ${viewport.name}px`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
      await expect(page).toHaveScreenshot(
        `layout-${route.replace(/\//g, "_") || "home"}-${viewport.name}.png`,
        { maxDiffPixelRatio: 0.02 },
      );
    });
  }
}
