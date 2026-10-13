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

  for (const scheme of ["light", "dark"] as const) {
    for (const width of [1280, 768, 390] as const) {
      test(`projects list @ ${width}px ${scheme}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${PROJECTS_PATH}?view=grid`);
        await page.waitForLoadState("networkidle");
        await setColorScheme(page, scheme);
        await expect(
          page.getByRole("heading", { name: "Projects" }),
        ).toBeVisible();
        await assertNoHorizontalOverflow(page);
        await page.screenshot({
          path: `${ARTIFACT_DIR}/projects-${width}-${scheme}-grid.png`,
          fullPage: true,
        });

        await page.getByRole("button", { name: "List view" }).click();
        await expect(page.locator('[data-slot="table"]')).toBeVisible();
        await page.screenshot({
          path: `${ARTIFACT_DIR}/projects-${width}-${scheme}-list.png`,
          fullPage: true,
        });
      });
    }
  }

  test("filters menu and archive confirm on e2e demo project", async ({
    page,
  }) => {
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
      path: `${ARTIFACT_DIR}/projects-archive-confirm-dialog.png`,
      fullPage: false,
    });
    await page.getByRole("button", { name: "Cancel" }).click();

    await row.getByRole("button", { name: "Project actions" }).click();
    await page.getByRole("menuitem", { name: "Set Inactive" }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.getByRole("button", { name: "Set inactive" }).click();
    await expect(page.getByText("Updating status…")).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByText("Project status updated")).toBeVisible({
      timeout: 15_000,
    });
    await page.screenshot({
      path: `${ARTIFACT_DIR}/projects-status-toast-success.png`,
      fullPage: false,
    });

    await row.getByRole("button", { name: "Project actions" }).click();
    await page.getByRole("menuitem", { name: "Set Active" }).click();
    await page.getByRole("button", { name: "Set active" }).click();
    await expect(page.getByText("Project status updated")).toBeVisible({
      timeout: 15_000,
    });
  });
});
