import { expect, test } from "@playwright/test";

test.describe("page security guards", () => {
  test("signed-out dashboard visitor is redirected to sign-in", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("unknown dashboard path renders not-found UI", async ({
    page,
    context,
  }) => {
    test.skip(
      process.env.E2E_TEST_MODE !== "1",
      "Requires E2E_TEST_MODE login setup",
    );
    const secret = process.env.E2E_TEST_SECRET ?? "local-e2e-secret";
    await page.goto("/");
    const login = await page.request.post("/api/e2e/login", {
      headers: { "x-e2e-secret": secret },
    });
    expect(login.ok()).toBeTruthy();
    await page.goto("/dashboard/does-not-exist-route-guard-e2e");
    await expect(page.getByText("Page not found")).toBeVisible();
  });
});
