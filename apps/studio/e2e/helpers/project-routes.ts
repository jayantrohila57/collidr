import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "@playwright/test";

const E2E_DEMO_PROJECT_NAME = "E2E Demo Project";
const E2E_DEMO_PROJECT_SLUG = "e2e-demo-project";
const LONG_DESC_QUERY = "e2eLongDescription=1";
const demoPathsFile = join(process.cwd(), "e2e/.auth/demo-paths.json");

type DemoPaths = { organizationSlug: string; projectSlug: string };

function readDemoPaths(): DemoPaths {
  try {
    return JSON.parse(readFileSync(demoPathsFile, "utf8")) as DemoPaths;
  } catch {
    return {
      organizationSlug: process.env.E2E_DEMO_ORG_SLUG ?? "",
      projectSlug: E2E_DEMO_PROJECT_SLUG,
    };
  }
}

export function e2eDemoProjectOverviewPath(options?: {
  longDescription?: boolean;
}) {
  const { organizationSlug, projectSlug } = readDemoPaths();
  const base = `/${organizationSlug}/${projectSlug}`;
  return options?.longDescription ? `${base}?${LONG_DESC_QUERY}` : base;
}

export function e2eDemoProjectEnvPath() {
  const { organizationSlug, projectSlug } = readDemoPaths();
  return `/${organizationSlug}/${projectSlug}/env`;
}

export async function openE2eDemoProjectOverview(
  page: Page,
  options?: { longDescription?: boolean },
) {
  await page.goto(e2eDemoProjectOverviewPath(options));
  await page.waitForLoadState("domcontentloaded");
  await page.getByRole("heading", { name: E2E_DEMO_PROJECT_NAME }).waitFor();
}

export async function openE2eDemoProjectEnv(page: Page) {
  await page.goto(e2eDemoProjectEnvPath());
  await page.waitForLoadState("domcontentloaded");
}
