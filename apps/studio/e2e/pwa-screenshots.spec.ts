import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { test } from "@playwright/test";

const root = path.resolve(__dirname, "../../..");
const faviconDirs = [
  "apps/studio/public/favicon",
  "apps/docs/public/favicon",
  "apps/auth/public/favicon",
].map((p) => path.join(root, p));

const outDir = path.join(root, ".tmp/pwa-screenshots");
const previewFile = path.join(
  root,
  "apps/studio/public/pwa-install-preview.html",
);

test.describe.configure({ mode: "serial" });

test.use({ storageState: { cookies: [], origins: [] } });

test("capture Loftlancer PWA screenshots", async ({ page }) => {
  test.skip(
    !process.env.CAPTURE_PWA_SCREENSHOTS,
    "Set CAPTURE_PWA_SCREENSHOTS=1",
  );

  await mkdir(outDir, { recursive: true });
  const studioWide = path.join(outDir, "studio-wide.png");
  const studioNarrow = path.join(outDir, "studio-narrow.png");

  await page.goto(`file://${previewFile}`, { waitUntil: "load" });
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.screenshot({ path: studioWide, type: "png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: studioNarrow, type: "png" });

  for (const dir of faviconDirs) {
    await mkdir(dir, { recursive: true });
    await copyFile(studioWide, path.join(dir, "screenshot-wide.png"));
    await copyFile(studioNarrow, path.join(dir, "screenshot-narrow.png"));
  }
});
