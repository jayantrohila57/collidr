import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { test } from "@playwright/test";

const root = path.resolve(__dirname, "../../..");
const wwwFavicon = path.join(root, "apps/www/public/favicon");
const outDir = path.join(root, ".tmp/pwa-screenshots");

test("capture www PWA screenshots", async ({ page, baseURL }) => {
  test.skip(
    !process.env.CAPTURE_PWA_SCREENSHOTS,
    "Set CAPTURE_PWA_SCREENSHOTS=1",
  );

  await mkdir(outDir, { recursive: true });
  const wwwWide = path.join(outDir, "www-wide.png");
  const wwwNarrow = path.join(outDir, "www-narrow.png");

  await page.goto(baseURL ?? "/", { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.screenshot({ path: wwwWide, type: "png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: wwwNarrow, type: "png" });

  await mkdir(wwwFavicon, { recursive: true });
  await copyFile(wwwWide, path.join(wwwFavicon, "screenshot-wide.png"));
  await copyFile(wwwNarrow, path.join(wwwFavicon, "screenshot-narrow.png"));
});
