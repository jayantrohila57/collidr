import { expect, test } from "@playwright/test";
import { hasE2eAuth } from "./helpers/auth";
import { assertNoHorizontalOverflow } from "./helpers/layout";

const ARTIFACT_DIR =
  process.env.PROJECT_DETAIL_SCREENSHOT_DIR ??
  "/opt/cursor/artifacts/screenshots/project-detail-mobile";

const VIEWPORTS = [
  { width: 375, height: 812, name: "375" },
  { width: 390, height: 844, name: "390" },
  { width: 1280, height: 800, name: "1280" },
] as const;

test.describe("project detail layout", () => {
  test.beforeAll(() => {
    test.skip(!hasE2eAuth(), "E2E_TEST_MODE or E2E_SESSION_COOKIE required");
  });

  for (const viewport of VIEWPORTS) {
    test(`project detail @ ${viewport.name}px`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("/dashboard/projects/e2e-demo-project");
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("#main-content")).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Environments" }),
      ).toBeVisible();
      await assertNoHorizontalOverflow(page);
      await page.screenshot({
        path: `${ARTIFACT_DIR}/project-detail-${viewport.name}.png`,
        fullPage: true,
      });
    });
  }
});
