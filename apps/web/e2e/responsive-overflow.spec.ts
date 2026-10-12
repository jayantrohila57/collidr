import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { width: 375, height: 812, name: "375" },
  { width: 768, height: 1024, name: "768" },
  { width: 1024, height: 768, name: "1024" },
] as const;

const ROUTES = [
  "/",
  "/dashboard",
  "/dashboard/projects",
  "/dashboard/projects/new",
] as const;

async function assertNoHorizontalOverflow(
  page: import("@playwright/test").Page,
) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth - doc.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
}

for (const viewport of VIEWPORTS) {
  for (const route of ROUTES) {
    test(`no horizontal overflow on ${route} at ${viewport.name}px`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await assertNoHorizontalOverflow(page);
    });
  }
}
