import { expect, test } from "@playwright/test";

test.describe("e2e login route guard", () => {
  test("POST /api/e2e/login is disabled when NODE_ENV is production", async ({
    request,
  }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
    const isProdRuntime = process.env.EXPECT_E2E_LOGIN_DISABLED === "1";

    test.skip(
      !isProdRuntime,
      "Set EXPECT_E2E_LOGIN_DISABLED=1 when testing a next start (production) server",
    );

    const response = await request.post(`${baseURL}/api/e2e/login`, {
      headers: {
        "x-e2e-secret": process.env.E2E_TEST_SECRET ?? "local-e2e-secret",
      },
    });

    expect(response.status()).toBe(404);
  });
});
