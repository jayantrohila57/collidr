import { db } from "@env-manager/db";
import { auditLog } from "@env-manager/db/schema/audit";
import { user } from "@env-manager/db/schema/auth";
import { invitation, member } from "@env-manager/db/schema/organization";
import {
  environment,
  environmentVariable,
  project,
} from "@env-manager/db/schema/projects";
import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import { TRPCError } from "@trpc/server";
import { and, count, eq, gte, or, sql } from "drizzle-orm";
import { z } from "zod/v3";
import type { Context } from "../context";
import {
  orgAwareProcedure,
  orgProcedure,
  protectedProcedure,
  router,
} from "../index";
import { projectListFilter } from "../org-access";

function projectScope(userId: string, organizationId: string | null) {
  return projectListFilter(userId, organizationId);
}

type OrgCtx = Context & {
  session: NonNullable<Context["session"]>;
  activeOrganizationId: string | null;
};

async function fetchDashboardStats(ctx: OrgCtx) {
  const userId = ctx.session.user.id;
  const scope = projectScope(userId, ctx.activeOrganizationId);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const memberCountPromise = ctx.activeOrganizationId
    ? db
        .select({ count: count() })
        .from(member)
        .where(eq(member.organizationId, ctx.activeOrganizationId))
    : Promise.resolve([{ count: 1 }]);

  const [
    totalProjectsResult,
    activeProjectsResult,
    privateProjectsResult,
    archivedOrMaintenanceResult,
    totalEnvironmentsResult,
    activeEnvironmentsResult,
    totalVariablesResult,
    projectsByStatusResult,
    environmentsByStatusResult,
    recentAuditLogsResult,
    productionEnvironmentsResult,
    totalMembersResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(project).where(scope),
    db
      .select({ count: count() })
      .from(project)
      .where(and(scope, eq(project.status, "active"))),
    db
      .select({ count: count() })
      .from(project)
      .where(and(scope, eq(project.isPublic, false))),
    db
      .select({ count: count() })
      .from(project)
      .where(
        and(
          scope,
          or(eq(project.isArchived, true), eq(project.status, "maintenance")),
        ),
      ),
    db
      .select({ count: count() })
      .from(environment)
      .innerJoin(project, eq(environment.projectId, project.id))
      .where(scope),
    db
      .select({ count: count() })
      .from(environment)
      .innerJoin(project, eq(environment.projectId, project.id))
      .where(and(scope, eq(environment.status, "active"))),
    db
      .select({ count: count() })
      .from(environmentVariable)
      .innerJoin(
        environment,
        eq(environmentVariable.environmentId, environment.id),
      )
      .innerJoin(project, eq(environment.projectId, project.id))
      .where(scope),
    db
      .select({
        status: project.status,
        count: count(),
      })
      .from(project)
      .where(scope)
      .groupBy(project.status),
    db
      .select({
        status: environment.status,
        count: count(),
      })
      .from(environment)
      .innerJoin(project, eq(environment.projectId, project.id))
      .where(scope)
      .groupBy(environment.status),
    db
      .select({ count: count() })
      .from(auditLog)
      .innerJoin(project, eq(auditLog.projectId, project.id))
      .where(
        and(
          eq(auditLog.userId, userId),
          gte(auditLog.createdAt, sevenDaysAgo),
          scope,
        ),
      ),
    db
      .select({ count: count() })
      .from(environment)
      .innerJoin(project, eq(environment.projectId, project.id))
      .where(and(scope, eq(environment.isProduction, true))),
    memberCountPromise,
  ]);

  return {
    totalProjects: totalProjectsResult[0]?.count || 0,
    activeProjects: activeProjectsResult[0]?.count || 0,
    privateProjects: privateProjectsResult[0]?.count || 0,
    archivedOrMaintenance: archivedOrMaintenanceResult[0]?.count || 0,
    totalMembers: totalMembersResult[0]?.count || 1,
    totalEnvironments: totalEnvironmentsResult[0]?.count || 0,
    activeEnvironments: activeEnvironmentsResult[0]?.count || 0,
    totalVariables: totalVariablesResult[0]?.count || 0,
    productionEnvironments: productionEnvironmentsResult[0]?.count || 0,
    recentAuditLogs: recentAuditLogsResult[0]?.count || 0,
    projectsByStatus: projectsByStatusResult.reduce(
      (acc, item) => {
        acc[item.status] = item.count;
        return acc;
      },
      {} as Record<string, number>,
    ),
    environmentsByStatus: environmentsByStatusResult.reduce(
      (acc, item) => {
        acc[item.status] = item.count;
        return acc;
      },
      {} as Record<string, number>,
    ),
  };
}

async function fetchRecentActivity(ctx: OrgCtx) {
  const userId = ctx.session.user.id;
  const scope = projectScope(userId, ctx.activeOrganizationId);

  const [recentProjects, recentAuditLogs] = await Promise.all([
    db
      .select({
        id: project.id,
        name: project.name,
        slug: project.slug,
        status: project.status,
        createdAt: project.createdAt,
      })
      .from(project)
      .where(scope)
      .orderBy(sql`${project.createdAt} DESC`)
      .limit(5),
    db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        entityType: auditLog.entityType,
        entitySlug: auditLog.entitySlug,
        createdAt: auditLog.createdAt,
      })
      .from(auditLog)
      .innerJoin(project, eq(auditLog.projectId, project.id))
      .where(and(eq(auditLog.userId, userId), scope))
      .orderBy(sql`${auditLog.createdAt} DESC`)
      .limit(10),
  ]);

  return {
    recentProjects: recentProjects.map((row) => ({
      ...row,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : String(row.createdAt),
    })),
    recentAuditLogs: recentAuditLogs.map((row) => ({
      ...row,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : String(row.createdAt),
    })),
  };
}

async function fetchProjectDetailStats(ctx: OrgCtx, slug: string) {
  const scope = projectListFilter(
    ctx.session.user.id,
    ctx.activeOrganizationId,
  );
  const [projectRow] = await db
    .select({
      id: project.id,
      updatedAt: project.updatedAt,
      isPublic: project.isPublic,
      isArchived: project.isArchived,
      status: project.status,
    })
    .from(project)
    .where(and(eq(project.slug, slug), scope))
    .limit(1);

  if (!projectRow) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
  }

  const [envCount, varCount] = await Promise.all([
    db
      .select({ count: count() })
      .from(environment)
      .where(eq(environment.projectId, projectRow.id)),
    db
      .select({ count: count() })
      .from(environmentVariable)
      .innerJoin(
        environment,
        eq(environmentVariable.environmentId, environment.id),
      )
      .where(eq(environment.projectId, projectRow.id)),
  ]);

  return {
    environmentCount: envCount[0]?.count ?? 0,
    variableCount: varCount[0]?.count ?? 0,
    updatedAt:
      projectRow.updatedAt instanceof Date
        ? projectRow.updatedAt.toISOString()
        : String(projectRow.updatedAt),
    isPublic: projectRow.isPublic,
    isArchived: projectRow.isArchived,
    status: projectRow.status,
  };
}

async function fetchOrgSettingsStats(ctx: OrgCtx) {
  if (!isOrganizationsEnabled() || !ctx.activeOrganizationId) {
    return {
      memberCount: 1,
      pendingInvites: 0,
      projectCount: 0,
      role: "owner" as string,
    };
  }

  const organizationId = ctx.activeOrganizationId;
  const userId = ctx.session.user.id;
  const scope = projectListFilter(userId, organizationId);

  const [memberCountRow, pendingRow, projectCountRow, roleRow] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(member)
        .where(eq(member.organizationId, organizationId)),
      db
        .select({ count: count() })
        .from(invitation)
        .where(
          and(
            eq(invitation.organizationId, organizationId),
            eq(invitation.status, "pending"),
          ),
        ),
      db.select({ count: count() }).from(project).where(scope),
      db
        .select({ role: member.role })
        .from(member)
        .where(
          and(
            eq(member.organizationId, organizationId),
            eq(member.userId, userId),
          ),
        )
        .limit(1),
    ]);

  return {
    memberCount: memberCountRow[0]?.count ?? 0,
    pendingInvites: pendingRow[0]?.count ?? 0,
    projectCount: projectCountRow[0]?.count ?? 0,
    role: roleRow[0]?.role ?? "member",
  };
}

async function fetchUserAccountStats(userId: string) {
  const [orgCountRow, projectCountRow, userRow] = await Promise.all([
    isOrganizationsEnabled()
      ? db
          .select({ count: count() })
          .from(member)
          .where(eq(member.userId, userId))
      : Promise.resolve([{ count: 0 }]),
    db
      .select({ count: count() })
      .from(project)
      .where(eq(project.userId, userId)),
    db
      .select({ createdAt: user.createdAt })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1),
  ]);

  const createdAt = userRow[0]?.createdAt;
  return {
    organizationCount: orgCountRow[0]?.count ?? 0,
    ownedProjectCount: projectCountRow[0]?.count ?? 0,
    accountCreatedAt:
      createdAt instanceof Date
        ? createdAt.toISOString()
        : createdAt
          ? String(createdAt)
          : null,
  };
}

async function fetchActivitySummary(ctx: OrgCtx) {
  const userId = ctx.session.user.id;
  const scope = projectListFilter(userId, ctx.activeOrganizationId);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const auditScope = and(eq(auditLog.userId, userId), scope);

  const [last7, last30, allTime, projectsWithEvents] = await Promise.all([
    db
      .select({ count: count() })
      .from(auditLog)
      .innerJoin(project, eq(auditLog.projectId, project.id))
      .where(and(auditScope, gte(auditLog.createdAt, sevenDaysAgo))),
    db
      .select({ count: count() })
      .from(auditLog)
      .innerJoin(project, eq(auditLog.projectId, project.id))
      .where(and(auditScope, gte(auditLog.createdAt, thirtyDaysAgo))),
    db
      .select({ count: count() })
      .from(auditLog)
      .innerJoin(project, eq(auditLog.projectId, project.id))
      .where(auditScope),
    db
      .select({ count: sql<number>`count(distinct ${auditLog.projectId})` })
      .from(auditLog)
      .innerJoin(project, eq(auditLog.projectId, project.id))
      .where(and(auditScope, gte(auditLog.createdAt, sevenDaysAgo))),
  ]);

  return {
    eventsLast7Days: last7[0]?.count ?? 0,
    eventsLast30Days: last30[0]?.count ?? 0,
    eventsAllTime: allTime[0]?.count ?? 0,
    projectsWithEventsLast7Days: Number(projectsWithEvents[0]?.count ?? 0),
  };
}

export const dashboardRouter = router({
  getOverview: orgProcedure.query(async ({ ctx }) => {
    const [stats, activity] = await Promise.all([
      fetchDashboardStats(ctx),
      fetchRecentActivity(ctx),
    ]);
    return { stats, activity };
  }),

  getStats: orgProcedure.query(async ({ ctx }) => fetchDashboardStats(ctx)),

  getRecentActivity: orgProcedure.query(async ({ ctx }) =>
    fetchRecentActivity(ctx),
  ),

  getProjectsListStats: orgProcedure.query(async ({ ctx }) => {
    const stats = await fetchDashboardStats(ctx);
    const scope = projectScope(ctx.session.user.id, ctx.activeOrganizationId);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const [publicProjectsResult, recentlyUpdatedResult] = await Promise.all([
      db
        .select({ count: count() })
        .from(project)
        .where(and(scope, eq(project.isPublic, true))),
      db
        .select({ count: count() })
        .from(project)
        .where(and(scope, gte(project.updatedAt, sevenDaysAgo))),
    ]);
    return {
      total: stats.totalProjects,
      active: stats.activeProjects,
      private: stats.privateProjects,
      public: publicProjectsResult[0]?.count ?? 0,
      archivedOrMaintenance: stats.archivedOrMaintenance,
      totalEnvironments: stats.totalEnvironments,
      totalVariables: stats.totalVariables,
      recentlyUpdated7d: recentlyUpdatedResult[0]?.count ?? 0,
    };
  }),

  getProjectDetailStats: orgProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => fetchProjectDetailStats(ctx, input.slug)),

  getOrgSettingsStats: orgProcedure.query(async ({ ctx }) =>
    fetchOrgSettingsStats(ctx),
  ),

  getUserAccountStats: protectedProcedure.query(async ({ ctx }) =>
    fetchUserAccountStats(ctx.session.user.id),
  ),

  getActivitySummary: orgAwareProcedure.query(async ({ ctx }) =>
    fetchActivitySummary({
      session: ctx.session,
      activeOrganizationId: ctx.activeOrganizationId,
    }),
  ),
});
