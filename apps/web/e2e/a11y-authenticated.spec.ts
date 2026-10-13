import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { seriousAxeViolations } from "./helpers/a11y";
import { hasE2eAuth } from "./helpers/auth";

const AUTH_ROUTES = [
  "/dashboard",
  "/dashboard/projects",
  "/dashboard/activity",
  "/dashboard/settings",
  "/dashboard/settings/organization",
  "/dashboard/projects/e2e-demo-project",
] as const;

test.describe("accessibility — authenticated app", () => {
  test.beforeAll(() => {
    test.skip(!hasE2eAuth(), "E2E_TEST_MODE or E2E_SESSION_COOKIE required");
  });

  for (const route of AUTH_ROUTES) {
    test(`no serious axe violations on ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("#main-content")).toBeVisible();

      const results = await new AxeBuilder({ page })
        .include("#main-content")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const serious = seriousAxeViolations(results);
      if (serious.length > 0) {
        console.log(JSON.stringify(serious, null, 2));
      }
      expect(serious).toEqual([]);
    });
  }
});
