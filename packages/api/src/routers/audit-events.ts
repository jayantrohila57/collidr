import { isActionsAuditEnabled } from "@env-manager/actions";
import { db } from "@env-manager/db";
import { auditEvent } from "@env-manager/db/schema/audit-event";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, lte, type SQL } from "drizzle-orm";
import { z } from "zod/v3";
import { requireAction } from "../actions/require-action";
import { orgAwareProcedure, router } from "../index";
import { getActiveOrganizationId } from "../org-access";

const listInput = z.object({
  scope: z.enum(["org", "self", "user"]),
  targetUserId: z.string().optional(),
  projectId: z.string().optional(),
  action: z.string().optional(),
  result: z.enum(["success", "failure", "denied"]).optional(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export const auditEventsRouter = router({
  list: orgAwareProcedure.input(listInput).query(async ({ ctx, input }) => {
    if (!isActionsAuditEnabled()) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Audit timeline is not enabled.",
      });
    }

    const organizationId = getActiveOrganizationId(ctx.session);
    const userId = ctx.session.user.id;

    if (input.scope === "self") {
      await requireAction("audit.timeline.view.self", {
        userId,
        organizationId,
      });
    } else if (input.scope === "org") {
      await requireAction("audit.timeline.view.org", {
        userId,
        organizationId,
      });
    } else if (input.scope === "user") {
      await requireAction("audit.timeline.view.user", {
        userId,
        organizationId,
        targetUserId: input.targetUserId,
      });
    }

    const conditions: SQL[] = [];

    if (input.scope === "self") {
      conditions.push(eq(auditEvent.actorUserId, userId));
    } else if (input.scope === "user" && input.targetUserId) {
      conditions.push(eq(auditEvent.actorUserId, input.targetUserId));
    } else if (input.scope === "org" && organizationId) {
      conditions.push(eq(auditEvent.organizationId, organizationId));
    }

    if (input.projectId) {
      conditions.push(eq(auditEvent.projectId, input.projectId));
    }
    if (input.action) {
      conditions.push(eq(auditEvent.action, input.action));
    }
    if (input.result) {
      conditions.push(eq(auditEvent.result, input.result));
    }
    if (input.cursor) {
      conditions.push(lte(auditEvent.createdAt, new Date(input.cursor)));
    }

    const rows = await db
      .select()
      .from(auditEvent)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(auditEvent.createdAt))
      .limit(input.limit + 1);

    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, input.limit) : rows;
    const nextCursor = hasMore
      ? items[items.length - 1]?.createdAt?.toISOString()
      : undefined;

    return { items, nextCursor };
  }),

  stats: orgAwareProcedure
    .input(z.object({ scope: z.enum(["org", "self"]).default("org") }))
    .query(async ({ ctx, input }) => {
      if (!isActionsAuditEnabled()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Audit timeline is not enabled.",
        });
      }

      const organizationId = getActiveOrganizationId(ctx.session);
      const userId = ctx.session.user.id;

      if (input.scope === "self") {
        await requireAction("audit.timeline.view.self", {
          userId,
          organizationId,
        });
      } else {
        await requireAction("audit.timeline.view.org", {
          userId,
          organizationId,
        });
      }

      const base =
        input.scope === "self"
          ? eq(auditEvent.actorUserId, userId)
          : organizationId
            ? eq(auditEvent.organizationId, organizationId)
            : eq(auditEvent.actorUserId, userId);

      const rows = await db
        .select({
          result: auditEvent.result,
          action: auditEvent.action,
        })
        .from(auditEvent)
        .where(base)
        .limit(5000);

      const byResult: Record<string, number> = {};
      const byAction: Record<string, number> = {};
      for (const row of rows) {
        byResult[row.result] = (byResult[row.result] ?? 0) + 1;
        byAction[row.action] = (byAction[row.action] ?? 0) + 1;
      }

      return { total: rows.length, byResult, byAction };
    }),
});
