import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { test } from "@playwright/test";

import { requireE2eTestSecret } from "./require-e2e-test-secret";

const root = path.resolve(__dirname, "../../..");
const faviconDirs = [
  "apps/studio/public/favicon",
  "apps/web/public/favicon",
  "apps/account/public/favicon",
  "apps/auth/public/favicon",
  "apps/www/public/favicon",
].map((p) => path.join(root, p));

const outDir = path.join(root, ".tmp/pwa-screenshots");

test.describe.configure({ mode: "serial" });

test.use({ storageState: { cookies: [], origins: [] } });

test("capture Loftlancer PWA screenshots", async ({ page, baseURL }) => {
  test.skip(
    !process.env.CAPTURE_PWA_SCREENSHOTS,
    "Set CAPTURE_PWA_SCREENSHOTS=1",
  );

  const login = await page.request.post("/api/e2e/login", {
    headers: {
      "content-type": "application/json",
      "x-e2e-secret": requireE2eTestSecret(),
    },
    data: {},
  });
  test.expect(login.ok()).toBeTruthy();

  await mkdir(outDir, { recursive: true });
  const studioWide = path.join(outDir, "studio-wide.png");
  const studioNarrow = path.join(outDir, "studio-narrow.png");

  await page.goto(`${baseURL}/`, { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.screenshot({ path: studioWide, type: "png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: studioNarrow, type: "png" });

  for (const dir of faviconDirs) {
    if (dir.includes("/apps/www/")) {
      continue;
    }
    await mkdir(dir, { recursive: true });
    await copyFile(studioWide, path.join(dir, "screenshot-wide.png"));
    await copyFile(studioNarrow, path.join(dir, "screenshot-narrow.png"));
  }
});
