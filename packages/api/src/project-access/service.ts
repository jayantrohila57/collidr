import {
  DEFAULT_TEAM_PROJECT_GRANTS,
  mergeProjectMemberGrants,
} from "@env-manager/actions";
import { db, softDeleteSet } from "@env-manager/db";
import { user } from "@env-manager/db/schema/auth";
import { member } from "@env-manager/db/schema/organization";
import {
  projectManager,
  projectMemberGrant,
  projectTeam,
} from "@env-manager/db/schema/project-access";
import { team, teamMember } from "@env-manager/db/schema/team";
import { isSoftDeletesEnabled } from "@env-manager/env/soft-deletes";
import { and, eq, inArray, isNull } from "drizzle-orm";

export async function applyDefaultGrantsForTeamOnProject(input: {
  organizationId: string;
  projectId: string;
  teamId: string;
  actorUserId: string;
}) {
  const teamMembers = await db
    .select({ userId: teamMember.userId })
    .from(teamMember)
    .where(eq(teamMember.teamId, input.teamId));

  if (!teamMembers.length) return;

  const orgMembers = await db
    .select({ userId: member.userId, role: member.role })
    .from(member)
    .where(
      and(
        eq(member.organizationId, input.organizationId),
        inArray(
          member.userId,
          teamMembers.map((row) => row.userId),
        ),
        isNull(member.deletedAt),
      ),
    );

  const memberUserIds = new Set(
    orgMembers.filter((row) => row.role === "member").map((row) => row.userId),
  );

  for (const userId of memberUserIds) {
    const [existing] = await db
      .select({ id: projectMemberGrant.id, grants: projectMemberGrant.grants })
      .from(projectMemberGrant)
      .where(
        and(
          eq(projectMemberGrant.projectId, input.projectId),
          eq(projectMemberGrant.userId, userId),
          isNull(projectMemberGrant.deletedAt),
        ),
      )
      .limit(1);

    const grants = mergeProjectMemberGrants(
      existing?.grants ?? [],
      DEFAULT_TEAM_PROJECT_GRANTS,
    );

    if (existing) {
      await db
        .update(projectMemberGrant)
        .set({
          grants,
          updatedBy: input.actorUserId,
          updatedAt: new Date(),
        })
        .where(eq(projectMemberGrant.id, existing.id));
    } else {
      await db.insert(projectMemberGrant).values({
        id: crypto.randomUUID(),
        organizationId: input.organizationId,
        projectId: input.projectId,
        userId,
        grants,
        updatedBy: input.actorUserId,
      });
    }
  }
}

export async function loadProjectAccessSummary(projectId: string) {
  const managers = await db
    .select({
      id: projectManager.id,
      userId: projectManager.userId,
      name: user.name,
      email: user.email,
    })
    .from(projectManager)
    .innerJoin(user, eq(projectManager.userId, user.id))
    .where(
      and(
        eq(projectManager.projectId, projectId),
        isNull(projectManager.deletedAt),
      ),
    );

  const teamsOnProject = await db
    .select({
      id: projectTeam.id,
      teamId: projectTeam.teamId,
      teamName: team.name,
    })
    .from(projectTeam)
    .innerJoin(team, eq(projectTeam.teamId, team.id))
    .where(
      and(eq(projectTeam.projectId, projectId), isNull(projectTeam.deletedAt)),
    );

  const grants = await db
    .select({
      id: projectMemberGrant.id,
      userId: projectMemberGrant.userId,
      grants: projectMemberGrant.grants,
      name: user.name,
      email: user.email,
    })
    .from(projectMemberGrant)
    .innerJoin(user, eq(projectMemberGrant.userId, user.id))
    .where(
      and(
        eq(projectMemberGrant.projectId, projectId),
        isNull(projectMemberGrant.deletedAt),
      ),
    );

  return { managers, teams: teamsOnProject, memberGrants: grants };
}

export async function upsertProjectManagerRow(input: {
  organizationId: string;
  projectId: string;
  userId: string;
  createdBy: string;
}) {
  const [existing] = await db
    .select({ id: projectManager.id, deletedAt: projectManager.deletedAt })
    .from(projectManager)
    .where(
      and(
        eq(projectManager.projectId, input.projectId),
        eq(projectManager.userId, input.userId),
      ),
    )
    .limit(1);

  if (existing?.deletedAt === null) {
    return { ok: true, id: existing.id };
  }

  if (existing && isSoftDeletesEnabled()) {
    await db
      .update(projectManager)
      .set({
        deletedAt: null,
        deletedBy: null,
        createdBy: input.createdBy,
      })
      .where(eq(projectManager.id, existing.id));
    return { ok: true, id: existing.id };
  }

  const id = crypto.randomUUID();
  await db.insert(projectManager).values({
    id,
    organizationId: input.organizationId,
    projectId: input.projectId,
    userId: input.userId,
    createdBy: input.createdBy,
  });
  return { ok: true, id };
}

export async function softDeleteProjectManager(input: {
  projectId: string;
  userId: string;
  actorUserId: string;
}) {
  if (!isSoftDeletesEnabled()) {
    await db
      .delete(projectManager)
      .where(
        and(
          eq(projectManager.projectId, input.projectId),
          eq(projectManager.userId, input.userId),
        ),
      );
    return { ok: true };
  }

  await db
    .update(projectManager)
    .set(softDeleteSet(input.actorUserId))
    .where(
      and(
        eq(projectManager.projectId, input.projectId),
        eq(projectManager.userId, input.userId),
        isNull(projectManager.deletedAt),
      ),
    );
  return { ok: true };
}

export async function upsertProjectTeamLink(input: {
  organizationId: string;
  projectId: string;
  teamId: string;
  createdBy: string;
}) {
  const [existing] = await db
    .select({ id: projectTeam.id, deletedAt: projectTeam.deletedAt })
    .from(projectTeam)
    .where(
      and(
        eq(projectTeam.projectId, input.projectId),
        eq(projectTeam.teamId, input.teamId),
      ),
    )
    .limit(1);

  if (existing?.deletedAt === null) {
    return { ok: true, id: existing.id };
  }

  if (existing && isSoftDeletesEnabled()) {
    await db
      .update(projectTeam)
      .set({
        deletedAt: null,
        deletedBy: null,
        createdBy: input.createdBy,
      })
      .where(eq(projectTeam.id, existing.id));
  } else {
    const id = crypto.randomUUID();
    await db.insert(projectTeam).values({
      id,
      organizationId: input.organizationId,
      projectId: input.projectId,
      teamId: input.teamId,
      createdBy: input.createdBy,
    });
  }

  await applyDefaultGrantsForTeamOnProject({
    organizationId: input.organizationId,
    projectId: input.projectId,
    teamId: input.teamId,
    actorUserId: input.createdBy,
  });

  return { ok: true };
}

export async function softDeleteProjectTeamLink(input: {
  projectId: string;
  teamId: string;
  actorUserId: string;
}) {
  if (!isSoftDeletesEnabled()) {
    await db
      .delete(projectTeam)
      .where(
        and(
          eq(projectTeam.projectId, input.projectId),
          eq(projectTeam.teamId, input.teamId),
        ),
      );
    return { ok: true };
  }

  await db
    .update(projectTeam)
    .set(softDeleteSet(input.actorUserId))
    .where(
      and(
        eq(projectTeam.projectId, input.projectId),
        eq(projectTeam.teamId, input.teamId),
        isNull(projectTeam.deletedAt),
      ),
    );
  return { ok: true };
}
