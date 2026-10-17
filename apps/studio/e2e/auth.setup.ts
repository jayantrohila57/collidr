import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { expect, test as setup } from "@playwright/test";
import { parseSessionCookies } from "./helpers/layout";

const authFile = "e2e/.auth/user.json";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

setup("prepare auth storage", async ({ browser }) => {
  mkdirSync(dirname(authFile), { recursive: true });
  const raw = process.env.E2E_SESSION_COOKIE?.trim();

  if (process.env.E2E_TEST_MODE === "1") {
    const secret = process.env.E2E_TEST_SECRET ?? "local-e2e-secret";
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(baseURL);
    const login = await page.request.post(`${baseURL}/api/e2e/login`, {
      headers: { "x-e2e-secret": secret },
    });
    expect(login.ok()).toBeTruthy();
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await expect(
      page.getByRole("heading", { name: /organizations/i }),
    ).toBeVisible();
    await context.storageState({ path: authFile });
    await context.close();
    return;
  }

  if (!raw) {
    await browser
      .newContext()
      .then((ctx) => ctx.storageState({ path: authFile }));
    return;
  }

  const context = await browser.newContext();
  await context.addCookies(parseSessionCookies(raw, baseURL));
  const page = await context.newPage();
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await context.storageState({ path: authFile });
  await context.close();
});
