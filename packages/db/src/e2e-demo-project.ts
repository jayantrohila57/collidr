import { and, eq } from "drizzle-orm";

import { db } from "./client";
import { E2E_DEMO_VAR_KEY, seedE2eDemoVariables } from "./e2e-demo-variables";

export { E2E_DEMO_VAR_KEY };

import { user } from "./schema/auth";
import { environment, project } from "./schema/projects";
import {
  activeEnvironmentWhere,
  activeProjectWhere,
  activeUserWhere,
} from "./soft-delete";

const E2E_EMAIL = "e2e-playwright@env-manager.local";
const E2E_PROJECT_NAME = "E2E Demo Project";
const E2E_PROJECT_SLUG = "e2e-demo-project";
const E2E_ENV_NAME = "Development";
const E2E_ENV_SLUG = "development";

export async function ensureE2eDemoProject() {
  const [userRow] = await db
    .select({ id: user.id })
    .from(user)
    .where(activeUserWhere(eq(user.email, E2E_EMAIL)))
    .limit(1);

  if (!userRow) {
    return;
  }

  let [projectRow] = await db
    .select({ id: project.id })
    .from(project)
    .where(
      activeProjectWhere(
        and(eq(project.userId, userRow.id), eq(project.slug, E2E_PROJECT_SLUG)),
      ),
    )
    .limit(1);

  const demoUrls = {
    repositoryUrl: "https://github.com/env-manager/e2e-demo",
    websiteUrl: "https://example.com/e2e-demo",
  };

  if (!projectRow) {
    const projectId = crypto.randomUUID();
    await db.insert(project).values({
      id: projectId,
      name: E2E_PROJECT_NAME,
      slug: E2E_PROJECT_SLUG,
      description: "Seeded for Playwright local verification.",
      userId: userRow.id,
      organizationId: null,
      ...demoUrls,
    });
    projectRow = { id: projectId };
  } else {
    await db.update(project).set(demoUrls).where(eq(project.id, projectRow.id));
  }

  let [envRow] = await db
    .select({ id: environment.id })
    .from(environment)
    .where(
      activeEnvironmentWhere(
        and(
          eq(environment.projectId, projectRow.id),
          eq(environment.slug, E2E_ENV_SLUG),
        ),
      ),
    )
    .limit(1);

  if (!envRow) {
    const envId = crypto.randomUUID();
    await db.insert(environment).values({
      id: envId,
      name: E2E_ENV_NAME,
      slug: E2E_ENV_SLUG,
      projectId: projectRow.id,
    });
    envRow = { id: envId };
  }

  await seedE2eDemoVariables(envRow.id, userRow.id);
}
