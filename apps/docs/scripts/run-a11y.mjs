#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const docsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const spec = path.join(docsDir, "e2e/a11y.spec.ts");

if (!existsSync(spec)) {
  console.log("docs a11y: no e2e/a11y.spec.ts — skipping");
  process.exit(0);
}

if (process.env.A11Y_SKIP === "1" || process.env.A11Y_SKIP === "true") {
  console.log("docs a11y: A11Y_SKIP set — skipping");
  process.exit(0);
}

const result = spawnSync(
  "pnpm",
  [
    "exec",
    "playwright",
    "test",
    "e2e/a11y.spec.ts",
    "--config",
    "playwright.a11y.config.ts",
  ],
  { cwd: docsDir, stdio: "inherit", env: process.env },
);

if (result.error) {
  console.error(`docs a11y: ${result.error.message}`);
  if (process.env.CI) {
    process.exit(1);
  }
  console.log("docs a11y: skipping (not in CI)");
  process.exit(0);
}

process.exit(result.status ?? 1);
