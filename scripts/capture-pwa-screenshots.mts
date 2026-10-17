#!/usr/bin/env node
/**
 * Regenerate PWA manifest screenshots via Playwright.
 *
 *   CAPTURE_PWA_SCREENSHOTS=1 pnpm capture:pwa-screenshots
 *
 * Screenshots the static `apps/studio/public/pwa-install-preview.html` shell (no
 * database or dev server). Install Chromium once: `pnpm --filter studio exec playwright install chromium`.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {
  ...process.env,
  CAPTURE_PWA_SCREENSHOTS: "1",
};

function run(cwd: string, args: string[]) {
  const result = spawnSync("pnpm", ["exec", "playwright", "test", ...args], {
    cwd,
    env,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(path.join(root, "apps/studio"), [
  "e2e/pwa-screenshots.spec.ts",
  "--config=playwright.capture.config.ts",
  "--project=chromium",
]);
