import { expect, test } from "@playwright/test";
import { hasE2eAuth } from "./helpers/auth";
import { assertNoHorizontalOverflow } from "./helpers/layout";
import {
  openE2eDemoProjectEnv,
  openE2eDemoProjectOverview,
  seededDemoEnvironmentId,
  variablesSearchInput,
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
  await page.evaluate((target) => {
    localStorage.setItem("theme", target);
    document.documentElement.classList.toggle("dark", target === "dark");
    document.documentElement.style.colorScheme = target;
  }, scheme);
  await page.waitForTimeout(150);
}

test.describe("project detail mobile layout", () => {
  test.describe.configure({ mode: "serial", timeout: 90_000 });

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
      await expect(page.getByRole("tab", { name: "Apps" })).toBeVisible();
      await expect(
        page.getByText("Environments", { exact: true }).first(),
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
    await expect(description).toBeVisible();
    await expect(description).toContainText("intentionally long");

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
      await openE2eDemoProjectEnv(page);
      await setColorScheme(page, scheme);
      await expect(
        page.getByRole("heading", { name: "Environments" }),
      ).toBeVisible();
      await assertNoHorizontalOverflow(page);
    });
  }

  test("project env @ 390px empty variables filter", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openE2eDemoProjectEnv(page, { waitForSearch: true });

    const search = variablesSearchInput(page);
    await expect(search).toBeVisible({ timeout: 15_000 });
    await search.fill("__e2e_no_match__");
    await expect(search).toHaveValue("__e2e_no_match__");
    await expect(
      page.getByRole("button", { name: "Add variable" }),
    ).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test("project env @ 390px shows seeded variable row", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openE2eDemoProjectEnv(page, { waitForSearch: true });

    const listInput = JSON.stringify({
      0: { json: { environmentId: await seededDemoEnvironmentId(page) } },
    });
    const listUrl = `/api/trpc/environmentVariables.list?batch=1&input=${encodeURIComponent(listInput)}`;
    const listRes = await page.request.get(listUrl);
    expect(listRes.ok()).toBeTruthy();
    const listBody = await listRes.json();
    const keys = JSON.stringify(listBody);
    expect(keys).toContain("E2E_DEMO_KEY");

    await assertNoHorizontalOverflow(page);
  });
});
