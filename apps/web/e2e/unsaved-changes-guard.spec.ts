import { expect, test } from "@playwright/test";
import { hasE2eAuth } from "./helpers/auth";

test.describe("unsaved changes guard", () => {
  test.beforeAll(() => {
    test.skip(!hasE2eAuth(), "E2E_TEST_MODE or E2E_SESSION_COOKIE required");
  });

  test("create project sheet prompts before dismiss", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/dashboard/projects");
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("button", { name: /new project|create project/i })
      .first()
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByLabel(/project name/i).fill("Guard test project");
    await page.keyboard.press("Escape");
    const discardDialog = page.getByRole("alertdialog");
    await expect(discardDialog).toBeVisible();
    await expect(discardDialog.getByText("Discard changes?")).toBeVisible();
  });
});
