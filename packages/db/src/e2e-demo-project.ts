import { and, eq } from "drizzle-orm";

import { db } from "./client";
import { assertE2eDemoVariableSeedAllowed } from "./e2e-demo-seed-guard";
import { seedE2eDemoVariables } from "./e2e-demo-variables";
import { slugifyPersonal } from "./personal-org-slug";
import { user } from "./schema/auth";
import { member, organization } from "./schema/organization";
import { projectApp } from "./schema/project-app";
import { environment, project } from "./schema/projects";
import {
  activeEnvironmentWhere,
  activeProjectWhere,
  activeUserWhere,
} from "./soft-delete";

export const E2E_DEMO_USER_EMAIL = "e2e-playwright@loftlancer.local";
export const E2E_DEMO_PROJECT_NAME = "E2E Demo Project";
export const E2E_DEMO_PROJECT_SLUG = "e2e-demo-project";
const E2E_ENV_NAME = "Development";
const E2E_ENV_SLUG = "development";

async function ensureE2ePersonalOrganization(
  userId: string,
  name: string,
): Promise<{ id: string; slug: string }> {
  const slug = slugifyPersonal(userId, name);

  const [existing] = await db
    .select({ id: organization.id, slug: organization.slug })
    .from(organization)
    .where(eq(organization.slug, slug))
    .limit(1);

  if (existing) {
    const [membership] = await db
      .select({ id: member.id })
      .from(member)
      .where(
        and(eq(member.organizationId, existing.id), eq(member.userId, userId)),
      )
      .limit(1);

    if (!membership) {
      await db.insert(member).values({
        id: crypto.randomUUID(),
        organizationId: existing.id,
        userId,
        role: "owner",
      });
    }

    return { id: existing.id, slug: existing.slug };
  }

  const organizationId = crypto.randomUUID();
  const orgName = `${name.split(" ")[0] || "My"}'s Workspace`;

  await db.insert(organization).values({
    id: organizationId,
    name: orgName,
    slug,
    logo: null,
    metadata: JSON.stringify({ type: "personal", e2e: true }),
  });

  await db.insert(member).values({
    id: crypto.randomUUID(),
    organizationId,
    userId,
    role: "owner",
  });

  return { id: organizationId, slug };
}

export async function ensureE2eDemoProject() {
  assertE2eDemoVariableSeedAllowed();

  const [userRow] = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(activeUserWhere(eq(user.email, E2E_DEMO_USER_EMAIL)))
    .limit(1);

  if (!userRow) {
    return;
  }

  const personalOrg = await ensureE2ePersonalOrganization(
    userRow.id,
    userRow.name,
  );

  let [projectRow] = await db
    .select({ id: project.id })
    .from(project)
    .where(
      activeProjectWhere(
        and(
          eq(project.userId, userRow.id),
          eq(project.slug, E2E_DEMO_PROJECT_SLUG),
        ),
      ),
    )
    .limit(1);

  const demoUrls = {
    repositoryUrl: "https://github.com/loftlancer/e2e-demo",
    websiteUrl: "https://example.com/e2e-demo",
  };

  if (!projectRow) {
    const projectId = crypto.randomUUID();
    await db.insert(project).values({
      id: projectId,
      name: E2E_DEMO_PROJECT_NAME,
      slug: E2E_DEMO_PROJECT_SLUG,
      description: "Seeded for Playwright local verification.",
      userId: userRow.id,
      organizationId: personalOrg.id,
      ...demoUrls,
    });
    projectRow = { id: projectId };
  } else {
    await db
      .update(project)
      .set({ organizationId: personalOrg.id, ...demoUrls })
      .where(eq(project.id, projectRow.id));
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

  const [envAppRow] = await db
    .select({ id: projectApp.id })
    .from(projectApp)
    .where(
      and(eq(projectApp.projectId, projectRow.id), eq(projectApp.appId, "env")),
    )
    .limit(1);

  if (!envAppRow) {
    await db.insert(projectApp).values({
      id: crypto.randomUUID(),
      organizationId: personalOrg.id,
      projectId: projectRow.id,
      appId: "env",
      installedBy: userRow.id,
    });
  }

  await seedE2eDemoVariables(envRow.id, userRow.id);

  return {
    organizationSlug: personalOrg.slug,
    projectSlug: E2E_DEMO_PROJECT_SLUG,
  };
}
