import { db } from "@env-manager/db";
import { auditLog } from "@env-manager/db/schema/audit";
import {
  environment,
  environmentVariable,
  project,
} from "@env-manager/db/schema/projects";
import { and, count, eq, sql } from "drizzle-orm";
import { protectedProcedure, router } from "../index";

export const dashboardRouter = router({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get total projects count
    const totalProjectsResult = await db
      .select({ count: count() })
      .from(project)
      .where(eq(project.userId, userId));

    // Get active projects count
    const activeProjectsResult = await db
      .select({ count: count() })
      .from(project)
      .where(and(eq(project.userId, userId), eq(project.status, "active")));

    // Get total environments count
    const totalEnvironmentsResult = await db
      .select({ count: count() })
      .from(environment)
      .innerJoin(project, eq(environment.projectId, project.id))
      .where(eq(project.userId, userId));

    // Get active environments count
    const activeEnvironmentsResult = await db
      .select({ count: count() })
      .from(environment)
      .innerJoin(project, eq(environment.projectId, project.id))
      .where(and(eq(project.userId, userId), eq(environment.status, "active")));

    // Get total environment variables count
    const totalVariablesResult = await db
      .select({ count: count() })
      .from(environmentVariable)
      .innerJoin(
        environment,
        eq(environmentVariable.environmentId, environment.id),
      )
      .innerJoin(project, eq(environment.projectId, project.id))
      .where(eq(project.userId, userId));

    // Get projects by status
    const projectsByStatusResult = await db
      .select({
        status: project.status,
        count: count(),
      })
      .from(project)
      .where(eq(project.userId, userId))
      .groupBy(project.status);

    // Get environments by status
    const environmentsByStatusResult = await db
      .select({
        status: environment.status,
        count: count(),
      })
      .from(environment)
      .innerJoin(project, eq(environment.projectId, project.id))
      .where(eq(project.userId, userId))
      .groupBy(environment.status);

    // Get recent audit logs count (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAuditLogsResult = await db
      .select({ count: count() })
      .from(auditLog)
      .where(
        and(
          eq(auditLog.userId, userId),
          sql`${auditLog.createdAt} >= ${sevenDaysAgo}`,
        ),
      );

    // Get production environments count
    const productionEnvironmentsResult = await db
      .select({ count: count() })
      .from(environment)
      .innerJoin(project, eq(environment.projectId, project.id))
      .where(
        and(eq(project.userId, userId), eq(environment.isProduction, true)),
      );

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

  getRecentActivity: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get recent projects
    const recentProjects = await db
      .select({
        id: project.id,
        name: project.name,
        slug: project.slug,
        status: project.status,
        createdAt: project.createdAt,
      })
      .from(project)
      .where(eq(project.userId, userId))
      .orderBy(sql`${project.createdAt} DESC`)
      .limit(5);

    // Get recent audit logs
    const recentAuditLogs = await db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        entityType: auditLog.entityType,
        entitySlug: auditLog.entitySlug,
        createdAt: auditLog.createdAt,
      })
      .from(auditLog)
      .where(eq(auditLog.userId, userId))
      .orderBy(sql`${auditLog.createdAt} DESC`)
      .limit(10);

    return {
      recentProjects,
      recentAuditLogs,
    };
  }),
});
