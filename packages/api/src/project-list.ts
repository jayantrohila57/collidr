import { normalizeOrgRole } from "@env-manager/actions";
import { activeProjectWhere, db } from "@env-manager/db";
import { member } from "@env-manager/db/schema/organization";
import {
  projectManager,
  projectMemberGrant,
  projectTeam,
} from "@env-manager/db/schema/project-access";
import { project } from "@env-manager/db/schema/projects";
import { teamMember } from "@env-manager/db/schema/team";
import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import { and, eq, inArray, isNull, sql, type SQL } from "drizzle-orm";
import { projectListFilter } from "./org-access";

export async function listAccessibleProjectIds(
  userId: string,
  organizationId: string | null,
): Promise<string[] | null> {
  if (!isOrganizationsEnabled() || !organizationId) {
    return null;
  }

  const [membership] = await db
    .select({ role: member.role })
    .from(member)
    .where(
      and(eq(member.organizationId, organizationId), eq(member.userId, userId)),
    )
    .limit(1);

  const orgRole = normalizeOrgRole(membership?.role);
  if (!orgRole) return [];

  if (orgRole === "owner") {
    const rows = await db
      .select({ id: project.id })
      .from(project)
      .where(
        and(
          eq(project.organizationId, organizationId),
          isNull(project.deletedAt),
        ),
      );
    return rows.map((r) => r.id);
  }

  if (orgRole === "manager") {
    const rows = await db
      .select({ id: project.id })
      .from(project)
      .innerJoin(
        projectManager,
        and(
          eq(projectManager.projectId, project.id),
          eq(projectManager.userId, userId),
          isNull(projectManager.deletedAt),
        ),
      )
      .where(
        and(
          eq(project.organizationId, organizationId),
          isNull(project.deletedAt),
        ),
      );
    return rows.map((r) => r.id);
  }

  const teamProjects = await db
    .select({ projectId: projectTeam.projectId })
    .from(projectTeam)
    .innerJoin(teamMember, eq(teamMember.teamId, projectTeam.teamId))
    .innerJoin(
      projectMemberGrant,
      and(
        eq(projectMemberGrant.projectId, projectTeam.projectId),
        eq(projectMemberGrant.userId, userId),
        isNull(projectMemberGrant.deletedAt),
      ),
    )
    .where(
      and(
        eq(teamMember.userId, userId),
        eq(projectTeam.organizationId, organizationId),
        isNull(projectTeam.deletedAt),
      ),
    );

  const ids = [...new Set(teamProjects.map((r) => r.projectId))];
  if (!ids.length) return [];

  const rows = await db
    .select({ id: project.id })
    .from(project)
    .where(
      and(
        inArray(project.id, ids),
        eq(project.organizationId, organizationId),
        isNull(project.deletedAt),
      ),
    );
  return rows.map((r) => r.id);
}

export function projectIdsFilter(projectIds: string[] | null) {
  if (projectIds === null) return undefined;
  if (!projectIds.length) {
    return sql`false`;
  }
  return inArray(project.id, projectIds);
}

/** Shared read scope for project rows (list, getBySlug, stats, mutations). */
export async function projectReadWhere(
  userId: string,
  organizationId: string | null,
): Promise<SQL | undefined> {
  const accessibleIds = await listAccessibleProjectIds(userId, organizationId);
  if (accessibleIds === null) {
    return projectListFilter(userId, organizationId);
  }

  const orgScope =
    isOrganizationsEnabled() && organizationId
      ? eq(project.organizationId, organizationId)
      : undefined;
  const idFilter = projectIdsFilter(accessibleIds);
  if (!orgScope) {
    return activeProjectWhere(idFilter);
  }
  return activeProjectWhere(and(orgScope, idFilter));
}
