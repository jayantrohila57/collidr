import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("accessibility", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("marketing home has no serious axe violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByTestId("marketing-landing").waitFor();

    const results = await new AxeBuilder({ page })
      .include('[data-testid="marketing-landing"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );

    expect(serious).toEqual([]);
  });
});
