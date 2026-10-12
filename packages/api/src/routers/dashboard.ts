import { db } from "@env-manager/db";
import { auditLog } from "@env-manager/db/schema/audit";
import {
  environment,
  environmentVariable,
  project,
} from "@env-manager/db/schema/projects";
import { and, count, eq, gte, sql } from "drizzle-orm";
import { orgProcedure, router } from "../index";
import { projectListFilter } from "../org-access";

function projectScope(userId: string, organizationId: string | null) {
  return projectListFilter(userId, organizationId);
}

export const dashboardRouter = router({
  getStats: orgProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const scope = projectScope(userId, ctx.activeOrganizationId);

    const totalProjectsResult = await db
      .select({ count: count() })
      .from(project)
      .where(scope);

    const activeProjectsResult = await db
      .select({ count: count() })
      .from(project)
      .where(and(scope, eq(project.status, "active")));

    const totalEnvironmentsResult = await db
      .select({ count: count() })
      .from(environment)
      .innerJoin(project, eq(environment.projectId, project.id))
      .where(scope);

    const activeEnvironmentsResult = await db
      .select({ count: count() })
      .from(environment)
      .innerJoin(project, eq(environment.projectId, project.id))
      .where(and(scope, eq(environment.status, "active")));

    const totalVariablesResult = await db
      .select({ count: count() })
      .from(environmentVariable)
      .innerJoin(
        environment,
        eq(environmentVariable.environmentId, environment.id),
      )
      .innerJoin(project, eq(environment.projectId, project.id))
      .where(scope);

    const projectsByStatusResult = await db
      .select({
        status: project.status,
        count: count(),
      })
      .from(project)
      .where(scope)
      .groupBy(project.status);

    const environmentsByStatusResult = await db
      .select({
        status: environment.status,
        count: count(),
      })
      .from(environment)
      .innerJoin(project, eq(environment.projectId, project.id))
      .where(scope)
      .groupBy(environment.status);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAuditLogsResult = await db
      .select({ count: count() })
      .from(auditLog)
      .innerJoin(project, eq(auditLog.projectId, project.id))
      .where(
        and(
          eq(auditLog.userId, userId),
          gte(auditLog.createdAt, sevenDaysAgo),
          scope,
        ),
      );

    const productionEnvironmentsResult = await db
      .select({ count: count() })
      .from(environment)
      .innerJoin(project, eq(environment.projectId, project.id))
      .where(and(scope, eq(environment.isProduction, true)));

    return {
      totalProjects: totalProjectsResult[0]?.count || 0,
      activeProjects: activeProjectsResult[0]?.count || 0,
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
  }),

  getRecentActivity: orgProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const scope = projectScope(userId, ctx.activeOrganizationId);

    const recentProjects = await db
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
      .limit(5);

    const recentAuditLogs = await db
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
      .limit(10);

    return {
      recentProjects,
      recentAuditLogs,
    };
  }),
});
