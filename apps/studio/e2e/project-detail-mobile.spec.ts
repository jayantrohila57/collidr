import { expect, test } from "@playwright/test";
import { hasE2eAuth } from "./helpers/auth";
import { assertNoHorizontalOverflow } from "./helpers/layout";
import {
  e2eDemoProjectEnvPath,
  openE2eDemoProjectOverview,
} from "./helpers/project-routes";

const VIEWPORTS = [
  { width: 375, height: 812, name: "375" },
  { width: 390, height: 844, name: "390" },
  { width: 1280, height: 800, name: "1280" },
] as const;

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

test.describe("project detail mobile layout", () => {
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
      await openE2eDemoProjectOverview(page);
      await expect(page.locator("#main-content")).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Environments" }),
      ).toBeVisible();
      await assertNoHorizontalOverflow(page);
    });
  }

  test("project overview long description metadata and stats @ 390px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openE2eDemoProjectOverview(page, { longDescription: true });

    const metadata = page.locator('[data-slot="page-header-metadata"]');
    await expect(metadata).toBeVisible();
    await expect(metadata.getByText("Slug", { exact: true })).toBeVisible();

    const description = page.locator('[data-slot="page-header-description"]');
    await expect(description).toHaveAttribute("data-expanded", "false");
    await expect(
      description.getByRole("button", { name: "more", exact: true }),
    ).toBeVisible();

    const statEnvironments = page
      .getByText("Environments", { exact: true })
      .first();
    const metaBox = await metadata.boundingBox();
    const statBox = await statEnvironments.boundingBox();
    if (metaBox && statBox) {
      expect(metaBox.y).toBeLessThan(statBox.y);
    }

    await assertNoHorizontalOverflow(page);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`project env @ 390px ${scheme}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(e2eDemoProjectEnvPath());
      await page.waitForLoadState("networkidle");
      await setColorScheme(page, scheme);
      await expect(
        page.getByRole("heading", { name: "Environments" }),
      ).toBeVisible();
      await assertNoHorizontalOverflow(page);
    });
  }

  test("project env @ 390px empty variables filter", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(e2eDemoProjectEnvPath());
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
  });

  test("project env @ 390px shows seeded variable row", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(e2eDemoProjectEnvPath());
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText("E2E_DEMO_KEY", { exact: true }).filter({ visible: true }),
    ).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });
});
