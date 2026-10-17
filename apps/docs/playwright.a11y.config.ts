import { defineConfig, devices } from "@playwright/test";

const docsPort = Number(process.env.A11Y_DOCS_PORT ?? 3010);
const baseURL = `http://127.0.0.1:${docsPort}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /a11y\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm exec next dev",
    cwd: process.cwd(),
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      ...process.env,
      SKIP_ENV_VALIDATION: "1",
      PORT: String(docsPort),
    },
  },
});
