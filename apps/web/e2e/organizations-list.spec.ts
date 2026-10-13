import { expect, test } from "@playwright/test";
import { hasE2eAuth } from "./helpers/auth";

const ORGANIZATIONS_PATH = "/dashboard/organizations";

test.describe("organizations list", () => {
  test.beforeAll(() => {
    test.skip(!hasE2eAuth(), "E2E_TEST_MODE or E2E_SESSION_COOKIE required");
  });

  test("filtered no-results shows a single Clear filters control", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(
      `${ORGANIZATIONS_PATH}?view=list&q=__e2e_no_matching_orgs__`,
    );
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("No matching organizations")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Clear filters" }),
    ).toHaveCount(1);
  });
});
