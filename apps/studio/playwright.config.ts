import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT ?? 3000);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command:
          process.env.E2E_USE_PROD_SERVER === "1"
            ? "pnpm build && pnpm start --port 3000"
            : "pnpm next dev --port 3000",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          ...process.env,
          SKIP_ENV_VALIDATION: "1",
          E2E_TEST_MODE: process.env.E2E_TEST_MODE ?? "1",
          E2E_TEST_SECRET: process.env.E2E_TEST_SECRET ?? "local-e2e-secret",
          ORGANIZATIONS_ENABLED: process.env.ORGANIZATIONS_ENABLED ?? "true",
          NEXT_PUBLIC_ORGANIZATIONS_ENABLED:
            process.env.NEXT_PUBLIC_ORGANIZATIONS_ENABLED ?? "true",
          NOTIFICATIONS_ENABLED: process.env.NOTIFICATIONS_ENABLED ?? "true",
          NEXT_PUBLIC_NOTIFICATIONS_ENABLED:
            process.env.NEXT_PUBLIC_NOTIFICATIONS_ENABLED ?? "true",
          BETTER_AUTH_SECRET:
            process.env.BETTER_AUTH_SECRET ??
            "playwright-local-auth-secret-32chars",
          NEXT_PUBLIC_DISABLE_REACT_QUERY_DEVTOOLS: "1",
        },
      },
});
