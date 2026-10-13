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

const PROJECT_DETAIL_PATH = "/dashboard/projects/e2e-demo-project";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const e2eSecret = process.env.E2E_TEST_SECRET ?? "local-e2e-secret";

async function seedE2eDemoVariable(
  request: import("@playwright/test").APIRequestContext,
) {
  const login = await request.post(`${baseURL}/api/e2e/login`, {
    headers: { "x-e2e-secret": e2eSecret },
  });
  expect(login.ok()).toBeTruthy();
}

test.describe("project detail layout", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    test.skip(!hasE2eAuth(), "E2E_TEST_MODE or E2E_SESSION_COOKIE required");
  });

  for (const viewport of VIEWPORTS) {
    test(`project detail @ ${viewport.name}px`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto(PROJECT_DETAIL_PATH);
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

  test("project detail @ 390px with seeded variable row", async ({
    page,
    request,
  }) => {
    await seedE2eDemoVariable(request);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(PROJECT_DETAIL_PATH);
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText("E2E_DEMO_KEY", { exact: true }).filter({ visible: true }),
    ).toBeVisible();
    await expect(
      page.locator('[data-slot="input-group"] svg').first(),
    ).toBeVisible();
    await assertNoHorizontalOverflow(page);
    await page.screenshot({
      path: `${ARTIFACT_DIR}/project-detail-390-with-variable.png`,
      fullPage: true,
    });
  });

  test("project detail @ 390px empty variables table", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(PROJECT_DETAIL_PATH);
    await page.waitForLoadState("networkidle");

    const demoKey = page
      .getByText("E2E_DEMO_KEY", { exact: true })
      .filter({ visible: true });
    if (await demoKey.count()) {
      await page.getByRole("button", { name: "Variable actions" }).click();
      await page.getByRole("menuitem", { name: "Delete" }).click();
      await page.getByRole("button", { name: "Delete" }).click();
      await expect(page.getByText("No variables yet")).toBeVisible({
        timeout: 15_000,
      });
    }

    await expect(
      page.getByRole("button", { name: "Add variable" }),
    ).toBeVisible();
    await expect(demoKey).toHaveCount(0);
    await assertNoHorizontalOverflow(page);
    await page.screenshot({
      path: `${ARTIFACT_DIR}/project-detail-390-empty.png`,
      fullPage: true,
    });
  });
});
