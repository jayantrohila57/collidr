import { activeMemberWhere, activeProjectWhere, db } from "@env-manager/db";
import { member, organization } from "@env-manager/db/schema/organization";
import { project } from "@env-manager/db/schema/projects";
import { and, eq, isNull } from "drizzle-orm";
import { assertProjectAccess } from "../org-access";
import { PageNotFoundError } from "./errors";

export type ResolvedOrganization = {
  id: string;
  slug: string;
  name: string;
};

export async function resolveOrganizationForPage(
  userId: string,
  slug: string,
): Promise<ResolvedOrganization> {
  const [row] = await db
    .select({
      id: organization.id,
      slug: organization.slug,
      name: organization.name,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(
      activeMemberWhere(
        and(
          eq(member.userId, userId),
          eq(organization.slug, slug),
          isNull(organization.deletedAt),
        ),
      ),
    )
    .limit(1);

  if (!row) {
    throw new PageNotFoundError("Organization not found");
  }

  return row;
}

export type ResolvedProject = {
  id: string;
  slug: string;
  organizationId: string | null;
};

export async function resolveProjectForPage(
  userId: string,
  slug: string,
  organizationId: string | null,
): Promise<ResolvedProject> {
  const scope = organizationId
    ? and(eq(project.slug, slug), eq(project.organizationId, organizationId))
    : eq(project.slug, slug);

  const [row] = await db
    .select({
      id: project.id,
      slug: project.slug,
      organizationId: project.organizationId,
    })
    .from(project)
    .where(activeProjectWhere(scope))
    .limit(1);

  if (!row) {
    throw new PageNotFoundError("Project not found");
  }

  await assertProjectAccess(userId, row.id, organizationId);

  return row;
}
