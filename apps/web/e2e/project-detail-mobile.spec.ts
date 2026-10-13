import { expect, test } from "@playwright/test";
import { hasE2eAuth } from "./helpers/auth";
import { assertNoHorizontalOverflow } from "./helpers/layout";

const OVERVIEW_ARTIFACT_DIR =
  process.env.PROJECT_OVERVIEW_SCREENSHOT_DIR ??
  "/opt/cursor/artifacts/screenshots/project-overview";

const ENVIRONMENTS_ARTIFACT_DIR =
  process.env.PROJECT_ENVIRONMENTS_SCREENSHOT_DIR ??
  "/opt/cursor/artifacts/screenshots/project-environments";

const LONG_DESC_QUERY = "e2eLongDescription=1";

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

const VIEWPORTS = [
  { width: 375, height: 812, name: "375" },
  { width: 390, height: 844, name: "390" },
  { width: 1280, height: 800, name: "1280" },
] as const;

const PROJECT_OVERVIEW_PATH = "/dashboard/projects/e2e-demo-project";
const PROJECT_ENVIRONMENTS_PATH = `${PROJECT_OVERVIEW_PATH}/environments`;
const PROJECT_OVERVIEW_LONG_DESC_PATH = `${PROJECT_OVERVIEW_PATH}?${LONG_DESC_QUERY}`;
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

test.describe("project overview layout", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    test.skip(!hasE2eAuth(), "E2E_TEST_MODE or E2E_SESSION_COOKIE required");
  });

  for (const viewport of VIEWPORTS) {
    test(`project overview @ ${viewport.name}px`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto(PROJECT_OVERVIEW_PATH);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("#main-content")).toBeVisible();
      await expect(
        page.getByRole("link", { name: /Environments & variables/i }),
      ).toBeVisible();
      await assertNoHorizontalOverflow(page);
      await page.screenshot({
        path: `${OVERVIEW_ARTIFACT_DIR}/project-overview-${viewport.name}.png`,
        fullPage: true,
      });
    });
  }

  for (const scheme of ["light", "dark"] as const) {
    for (const width of [1280, 390] as const) {
      test(`project overview @ ${width}px ${scheme}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(PROJECT_OVERVIEW_PATH);
        await page.waitForLoadState("networkidle");
        await setColorScheme(page, scheme);
        await expect(
          page.getByRole("heading", { name: "E2E Demo Project" }),
        ).toBeVisible();
        await assertNoHorizontalOverflow(page);
        await page.screenshot({
          path: `${OVERVIEW_ARTIFACT_DIR}/project-overview-${width}-${scheme}.png`,
          fullPage: true,
        });
      });
    }
  }

  for (const scheme of ["light", "dark"] as const) {
    for (const width of [1280, 390] as const) {
      test(`project environments @ ${width}px ${scheme}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(PROJECT_ENVIRONMENTS_PATH);
        await page.waitForLoadState("networkidle");
        await setColorScheme(page, scheme);
        await expect(
          page.getByRole("heading", { name: "Environments" }),
        ).toBeVisible();
        await assertNoHorizontalOverflow(page);
        await page.screenshot({
          path: `${ENVIRONMENTS_ARTIFACT_DIR}/project-environments-${width}-${scheme}.png`,
          fullPage: true,
        });
      });
    }
  }

  for (const scheme of ["light", "dark"] as const) {
    for (const width of [1280, 768, 390] as const) {
      test(`project overview header @ ${width}px ${scheme} long description`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(PROJECT_OVERVIEW_LONG_DESC_PATH);
        await page.waitForLoadState("networkidle");
        await setColorScheme(page, scheme);

        const metadata = page.locator('[data-slot="page-header-metadata"]');
        await expect(metadata).toBeVisible();
        await expect(metadata.getByText("Slug", { exact: true })).toBeVisible();

        const description = page.getByText(/intentionally long/i);
        await expect(description).toBeVisible();

        const statEnvironments = page
          .getByText("Environments", { exact: true })
          .first();
        const metaBox = await metadata.boundingBox();
        const statBox = await statEnvironments.boundingBox();
        if (metaBox && statBox) {
          expect(metaBox.y).toBeLessThan(statBox.y);
        }

        if (width >= 768) {
          const title = page.getByRole("heading", {
            name: "E2E Demo Project",
          });
          const titleBox = await title.boundingBox();
          if (titleBox && metaBox) {
            expect(Math.abs(titleBox.y - metaBox.y)).toBeLessThan(120);
          }
        }

        await assertNoHorizontalOverflow(page);
        await page.screenshot({
          path: `${OVERVIEW_ARTIFACT_DIR}/project-overview-${width}-${scheme}-long-desc.png`,
          fullPage: true,
        });
      });
    }
  }

  test("project environments @ 390px empty variables table", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(PROJECT_ENVIRONMENTS_PATH);
    await page.waitForLoadState("networkidle");

    const search = page.locator('[data-slot="input-group"] input');
    await expect(search).toBeVisible({ timeout: 15_000 });
    await search.fill("__e2e_no_match__");
    await expect(page.getByText("No matching variables")).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByRole("button", { name: "Add variable" }),
    ).toBeVisible();
    await assertNoHorizontalOverflow(page);
    await page.screenshot({
      path: `${ENVIRONMENTS_ARTIFACT_DIR}/project-environments-390-empty.png`,
      fullPage: true,
    });
  });

  test("project environments @ 390px with seeded variable row", async ({
    page,
    request,
  }) => {
    await seedE2eDemoVariable(request);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(PROJECT_ENVIRONMENTS_PATH);
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText("E2E_DEMO_KEY", { exact: true }).filter({ visible: true }),
    ).toBeVisible();
    await expect(
      page.locator('[data-slot="input-group"] svg').first(),
    ).toBeVisible();
    await assertNoHorizontalOverflow(page);
    await page.screenshot({
      path: `${ENVIRONMENTS_ARTIFACT_DIR}/project-environments-390-with-variable.png`,
      fullPage: true,
    });
  });

  test("page header description collapsed and expanded @ 1280", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(PROJECT_OVERVIEW_LONG_DESC_PATH);
    await page.waitForLoadState("networkidle");
    await setColorScheme(page, "dark");
    const description = page.locator('[data-slot="page-header-description"]');
    await expect(description).toHaveAttribute("data-expanded", "false");
    await expect(
      description.getByRole("button", { name: "… more" }),
    ).toBeVisible();
    await page.screenshot({
      path: `${OVERVIEW_ARTIFACT_DIR}/project-overview-header-desc-collapsed.png`,
      fullPage: false,
    });
    await description.getByRole("button", { name: "… more" }).click();
    await expect(description).toHaveAttribute("data-expanded", "true");
    await expect(
      description.getByRole("button", { name: "less" }),
    ).toBeVisible();
    await page.screenshot({
      path: `${OVERVIEW_ARTIFACT_DIR}/project-overview-header-desc-expanded.png`,
      fullPage: false,
    });
  });
});
