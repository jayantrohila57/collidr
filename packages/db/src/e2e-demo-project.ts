import { eq } from "drizzle-orm";

import { db } from "./client";
import { user } from "./schema/auth";
import { environment, project } from "./schema/projects";

const E2E_EMAIL = "e2e-playwright@env-manager.local";
const E2E_PROJECT_NAME = "E2E Demo Project";
const E2E_PROJECT_SLUG = "e2e-demo-project";

export async function ensureE2eDemoProject() {
  const [row] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, E2E_EMAIL))
    .limit(1);

  if (!row) {
    return;
  }

  const [existing] = await db
    .select({ id: project.id })
    .from(project)
    .where(eq(project.userId, row.id))
    .limit(1);

  if (existing) {
    return;
  }

  const projectId = crypto.randomUUID();
  await db.insert(project).values({
    id: projectId,
    name: E2E_PROJECT_NAME,
    slug: E2E_PROJECT_SLUG,
    description: "Seeded for Playwright local verification.",
    userId: row.id,
    organizationId: null,
  });

  await db.insert(environment).values({
    id: crypto.randomUUID(),
    name: "Development",
    slug: "development",
    projectId,
  });
}
