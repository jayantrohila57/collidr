import { expect, test } from "@playwright/test";
import {
  assertNoHorizontalOverflow,
  assertStableMainHeight,
} from "./helpers/layout";

const VIEWPORTS = [
  { width: 375, height: 812, name: "375" },
  { width: 768, height: 1024, name: "768" },
  { width: 1280, height: 800, name: "1280" },
] as const;

const AUTH_ROUTES = [
  "/dashboard",
  "/dashboard/projects",
  "/dashboard/projects/new",
  "/dashboard/settings",
  "/dashboard/settings/organization",
] as const;

const hasAuth = Boolean(process.env.E2E_SESSION_COOKIE?.trim());

for (const viewport of VIEWPORTS) {
  for (const route of AUTH_ROUTES) {
    test(`authenticated layout ${route} at ${viewport.name}px`, async ({
      page,
    }) => {
      test.skip(
        !hasAuth,
        "Set E2E_SESSION_COOKIE to run authenticated layout tests",
      );

      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await expect(page).not.toHaveURL(/\/$/);
      await assertNoHorizontalOverflow(page);
      await assertStableMainHeight(page);
    });
  }
}
