import { isActionsAuditEnabled } from "@env-manager/actions";
import { activeUserWhere, db } from "@env-manager/db";
import { auditEvent } from "@env-manager/db/schema/audit-event";
import { session, user } from "@env-manager/db/schema/auth";
import { organization } from "@env-manager/db/schema/organization";
import { project } from "@env-manager/db/schema/projects";
import { desc, eq, ilike, isNull, sql } from "drizzle-orm";
import { z } from "zod/v3";
import { requireAction } from "../actions/require-action";
import { isConsoleOperator } from "../console-access";
import { consoleProcedure, protectedProcedure, router } from "../index";
import { makeResponseSchema, respond } from "../validation";

const userRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  banned: z.boolean(),
  createdAt: z.string(),
});

export const platformRouter = router({
  accessStatus: protectedProcedure.query(({ ctx }) => {
    const allowed = isConsoleOperator(ctx.session);
    return {
      allowed,
      reason: allowed ? null : "forbidden",
    };
  }),

  overview: consoleProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    if (isActionsAuditEnabled()) {
      await requireAction("platform.user.list", { userId });
    }

    const [[userCount], [orgCount], [projectCount], [sessionCount]] =
      await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(user)
          .where(activeUserWhere()),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(organization)
          .where(isNull(organization.deletedAt)),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(project)
          .where(isNull(project.deletedAt)),
        db.select({ count: sql<number>`count(*)::int` }).from(session),
      ]);

    return {
      users: userCount?.count ?? 0,
      organizations: orgCount?.count ?? 0,
      projects: projectCount?.count ?? 0,
      sessions: sessionCount?.count ?? 0,
    };
  }),

  listUsers: consoleProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(100).default(50),
          offset: z.number().int().min(0).default(0),
          search: z.string().optional(),
        })
        .optional(),
    )
    .output(makeResponseSchema(z.array(userRowSchema)))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (isActionsAuditEnabled()) {
        await requireAction("platform.user.list", { userId });
      }

      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;
      const search = input?.search?.trim();

      const rows = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          banned: user.banned,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(
          activeUserWhere(
            search ? ilike(user.email, `%${search}%`) : undefined,
          ),
        )
        .orderBy(desc(user.createdAt))
        .limit(limit)
        .offset(offset);

      return respond({
        message: "Users fetched",
        data: rows.map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
          banned: row.banned,
          createdAt:
            row.createdAt instanceof Date
              ? row.createdAt.toISOString()
              : String(row.createdAt),
        })),
      });
    }),

  setUserRole: consoleProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["admin", "user"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (isActionsAuditEnabled()) {
        await requireAction("platform.user.set_role", {
          userId: ctx.session.user.id,
          targetUserId: input.userId,
        });
      }

      await db
        .update(user)
        .set({ role: input.role, updatedAt: new Date() })
        .where(eq(user.id, input.userId));

      return { ok: true as const };
    }),

  listOrganizations: consoleProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(100).default(50),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (isActionsAuditEnabled()) {
        await requireAction("platform.user.list", { userId });
      }

      const limit = input?.limit ?? 50;
      const rows = await db
        .select({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          createdAt: organization.createdAt,
        })
        .from(organization)
        .where(isNull(organization.deletedAt))
        .orderBy(desc(organization.createdAt))
        .limit(limit);

      return {
        items: rows.map((row) => ({
          ...row,
          createdAt:
            row.createdAt instanceof Date
              ? row.createdAt.toISOString()
              : String(row.createdAt),
        })),
      };
    }),

  listSessions: consoleProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(100).default(50),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (isActionsAuditEnabled()) {
        await requireAction("platform.user.list", { userId });
      }

      const limit = input?.limit ?? 50;
      const rows = await db
        .select({
          id: session.id,
          userId: session.userId,
          userEmail: user.email,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          impersonatedBy: session.impersonatedBy,
        })
        .from(session)
        .innerJoin(user, eq(session.userId, user.id))
        .orderBy(desc(session.createdAt))
        .limit(limit);

      return {
        items: rows.map((row) => ({
          id: row.id,
          userId: row.userId,
          userEmail: row.userEmail,
          impersonatedBy: row.impersonatedBy,
          createdAt:
            row.createdAt instanceof Date
              ? row.createdAt.toISOString()
              : String(row.createdAt),
          expiresAt:
            row.expiresAt instanceof Date
              ? row.expiresAt.toISOString()
              : String(row.expiresAt),
        })),
      };
    }),

  listAuditEvents: consoleProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(100).default(50),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (isActionsAuditEnabled()) {
        await requireAction("platform.user.list", { userId });
      }

      const limit = input?.limit ?? 50;
      const rows = await db
        .select({
          id: auditEvent.id,
          action: auditEvent.action,
          result: auditEvent.result,
          actorUserId: auditEvent.actorUserId,
          organizationId: auditEvent.organizationId,
          createdAt: auditEvent.createdAt,
        })
        .from(auditEvent)
        .orderBy(desc(auditEvent.createdAt))
        .limit(limit);

      return { items: rows };
    }),
});
