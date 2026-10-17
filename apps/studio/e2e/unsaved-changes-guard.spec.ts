import { expect, test } from "@playwright/test";
import { hasE2eAuth } from "./helpers/auth";

const E2E_ORG_SLUG = "e2e-notifications-org";

test.describe("unsaved changes guard", () => {
  test.beforeAll(() => {
    test.skip(!hasE2eAuth(), "E2E_TEST_MODE or E2E_SESSION_COOKIE required");
  });

  test("create project sheet prompts before dismiss", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/${E2E_ORG_SLUG}/projects/new`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByLabel(/project name/i).fill("Guard test project");
    await page.keyboard.press("Escape");
    const discardDialog = page.getByRole("alertdialog");
    await expect(discardDialog).toBeVisible();
    await expect(discardDialog.getByText("Discard changes?")).toBeVisible();
  });

  test("create organization sheet prompts before dismiss", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/new");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByLabel(/^name$/i).fill("Guard test org");
    await page.keyboard.press("Escape");
    const discardDialog = page.getByRole("alertdialog");
    await expect(discardDialog).toBeVisible();
    await expect(discardDialog.getByText("Discard changes?")).toBeVisible();
  });

  test("edit organization sheet prompts before dismiss", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/${E2E_ORG_SLUG}/settings`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /edit organization/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const nameInput = page.getByLabel(/^name$/i);
    await nameInput.fill("Guard test org rename");
    await page.keyboard.press("Escape");
    const discardDialog = page.getByRole("alertdialog");
    await expect(discardDialog).toBeVisible();
    await expect(discardDialog.getByText("Discard changes?")).toBeVisible();
  });
});
