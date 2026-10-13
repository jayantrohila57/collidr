import { encrypt } from "@env-manager/crypto";
import { and, eq } from "drizzle-orm";

import { db } from "./client";
import { E2E_DEMO_VAR_KEY } from "./e2e-demo-project";
import { user } from "./schema/auth";
import { environment, environmentVariable, project } from "./schema/projects";

const E2E_EMAIL = "e2e-playwright@env-manager.local";
const E2E_PROJECT_SLUG = "e2e-demo-project";
const E2E_ENV_SLUG = "development";
const E2E_DEMO_VAR_VALUE = "playwright-local-demo-value";

export async function ensureE2eDemoVariable() {
  const [userRow] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, E2E_EMAIL))
    .limit(1);

  if (!userRow) {
    return;
  }

  const [projectRow] = await db
    .select({ id: project.id })
    .from(project)
    .where(
      and(eq(project.userId, userRow.id), eq(project.slug, E2E_PROJECT_SLUG)),
    )
    .limit(1);

  if (!projectRow) {
    return;
  }

  const [envRow] = await db
    .select({ id: environment.id })
    .from(environment)
    .where(
      and(
        eq(environment.projectId, projectRow.id),
        eq(environment.slug, E2E_ENV_SLUG),
      ),
    )
    .limit(1);

  if (!envRow) {
    return;
  }

  const [existingVar] = await db
    .select({ id: environmentVariable.id })
    .from(environmentVariable)
    .where(
      and(
        eq(environmentVariable.environmentId, envRow.id),
        eq(environmentVariable.key, E2E_DEMO_VAR_KEY),
      ),
    )
    .limit(1);

  if (existingVar) {
    return;
  }

  await db.insert(environmentVariable).values({
    id: crypto.randomUUID(),
    key: E2E_DEMO_VAR_KEY,
    encryptedValue: encrypt(E2E_DEMO_VAR_VALUE),
    environmentId: envRow.id,
  });
}
