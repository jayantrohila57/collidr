import { expect, test } from "@playwright/test";
import {
  assertNoHorizontalOverflow,
  assertNoVerticalPageScroll,
} from "./helpers/layout";

test.describe("split landing", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("desktop 1280x800 has no page scroll", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByTestId("marketing-sign-in")).toBeVisible();
    await assertNoHorizontalOverflow(page);
    await assertNoVerticalPageScroll(page);
  });

  test("tablet and mobile sign-in panel", async ({ page }) => {
    for (const size of [
      { width: 768, height: 1024 },
      { width: 375, height: 812 },
    ]) {
      await page.setViewportSize(size);
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");
      await expect(page.getByTestId("marketing-sign-in")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Continue with GitHub" }),
      ).toBeVisible();
      await assertNoHorizontalOverflow(page);
    }
  });
});
