import { expect, test } from "@playwright/test";
import { hasE2eAuth } from "./helpers/auth";
import { assertNoHorizontalOverflow } from "./helpers/layout";

const ARTIFACT_DIR =
  process.env.PROJECTS_LIST_SCREENSHOT_DIR ??
  "/opt/cursor/artifacts/screenshots/projects-list";

const PROJECTS_PATH = "/dashboard/projects";
async function setColorScheme(
  page: import("@playwright/test").Page,
  scheme: "light" | "dark",
) {
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page
    .getByRole("menuitem", { name: scheme === "dark" ? "Dark" : "Light" })
    .click();
  await page.waitForTimeout(300);
}

test.describe("projects list", () => {
  test.beforeAll(() => {
    test.skip(!hasE2eAuth(), "E2E_TEST_MODE or E2E_SESSION_COOKIE required");
  });

  test("projects grid view @ 1280 dark", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${PROJECTS_PATH}?view=grid`);
    await page.waitForLoadState("networkidle");
    await setColorScheme(page, "dark");
    await assertNoHorizontalOverflow(page);
    await page.screenshot({
      path: `${ARTIFACT_DIR}/projects-grid-1280-dark.png`,
      fullPage: true,
    });
  });

  test("projects list view with filters open @ 1280 dark", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${PROJECTS_PATH}?view=list`);
    await page.waitForLoadState("networkidle");
    await setColorScheme(page, "dark");
    await page.getByLabel("Filter by status").click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.screenshot({
      path: `${ARTIFACT_DIR}/projects-list-filters-open-1280-dark.png`,
      fullPage: false,
    });
  });

  test("filtered no-results shows a single Clear filters control", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(
      `${PROJECTS_PATH}?view=list&q=__e2e_no_matching_projects__`,
    );
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("No matching projects")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Clear filters" }),
    ).toHaveCount(1);
  });

  test("filters menu and archive confirm on e2e demo project", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${PROJECTS_PATH}?view=list`);
    await page.waitForLoadState("networkidle");
    await setColorScheme(page, "dark");

    await page.getByLabel("Filter by status").click();
    await page.screenshot({
      path: `${ARTIFACT_DIR}/projects-filters-status-open.png`,
      fullPage: false,
    });
    await page.keyboard.press("Escape");

    const row = page.getByRole("row", { name: /E2E Demo Project/i });
    await row.getByRole("button", { name: "Project actions" }).click();
    await page.getByRole("menuitem", { name: "Archive Project" }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await expect(
      page.getByText("Are you sure you want to archive"),
    ).toBeVisible();
    await page.screenshot({
      path: `${ARTIFACT_DIR}/projects-confirm-dialog-archive.png`,
      fullPage: false,
    });
    await page.getByRole("button", { name: "Cancel" }).click();

    await row.getByRole("button", { name: "Project actions" }).click();
    const isInactive = await row
      .getByText("Inactive", { exact: true })
      .isVisible();
    const statusMenuItem = isInactive ? "Set Active" : "Set Inactive";
    const statusConfirm = isInactive ? "Set active" : "Set inactive";
    await page.getByRole("menuitem", { name: statusMenuItem }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.getByRole("button", { name: statusConfirm }).click();
    const loadingToast = page.getByText(
      isInactive ? "Updating status…" : "Updating status…",
    );
    if (await loadingToast.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await page.screenshot({
        path: `${ARTIFACT_DIR}/projects-mutation-loading-toast.png`,
        fullPage: false,
      });
    }
    await expect(page.getByText("Project status updated")).toBeVisible({
      timeout: 15_000,
    });
    await page.screenshot({
      path: `${ARTIFACT_DIR}/projects-status-toast-success.png`,
      fullPage: false,
    });
  });
});
