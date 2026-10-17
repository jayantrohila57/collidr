import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, type Page } from "@playwright/test";

const E2E_DEMO_PROJECT_SLUG = "e2e-demo-project";
const E2E_DEMO_ENV_SLUG = "development";
const LONG_DESC_QUERY = "e2eLongDescription=1";
const demoPathsFile = join(process.cwd(), "e2e/.auth/demo-paths.json");

function variablesSearchInput(page: Page) {
  return page
    .getByRole("textbox", { name: /Search variables/i })
    .filter({ visible: true })
    .first();
}

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
  return `/${organizationSlug}/${projectSlug}/env/${E2E_DEMO_ENV_SLUG}`;
}

export async function openE2eDemoProjectOverview(
  page: Page,
  options?: { longDescription?: boolean },
) {
  await page.goto(e2eDemoProjectOverviewPath(options), { waitUntil: "load" });
  await expect(page.locator("#main-content")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("tab", { name: "Apps" })).toBeVisible({
    timeout: 30_000,
  });
}

export async function openE2eDemoProjectEnv(
  page: Page,
  options?: { waitForSearch?: boolean },
) {
  await page.goto(e2eDemoProjectEnvPath(), { waitUntil: "load" });
  await expect(page.getByRole("heading", { name: "Environments" })).toBeVisible(
    { timeout: 30_000 },
  );
  if (options?.waitForSearch) {
    const search = variablesSearchInput(page);
    await expect(search).toBeVisible({ timeout: 30_000 });
  }
}

export async function seededDemoEnvironmentId(page: Page) {
  const slug = readDemoPaths().projectSlug;
  const input = JSON.stringify({ 0: { json: { slug } } });
  const url = `/api/trpc/projects.getBySlug?batch=1&input=${encodeURIComponent(input)}`;
  const res = await page.request.get(url);
  expect(res.ok()).toBeTruthy();
  const body = (await res.json()) as [
    {
      result: {
        data: {
          json: {
            data: { environments: { id: string; slug: string }[] };
          };
        };
      };
    },
  ];
  const environments = body[0]?.result?.data?.json?.data?.environments ?? [];
  const development =
    environments.find((env) => env.slug === E2E_DEMO_ENV_SLUG) ??
    environments[0];
  expect(development?.id).toBeTruthy();
  return development.id;
}

export { variablesSearchInput };
