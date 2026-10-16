import {
  type ActionName,
  evaluatePermission,
  getActionDefinition,
  isActionsAuditEnabled,
  isPlatformAdmin,
  normalizeOrgRole,
} from "@loftlancer/actions";
import { activeMemberWhere, db } from "@loftlancer/db";
import { member } from "@loftlancer/db/schema/organization";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { writeAuditEvent } from "./audit-event-writer";
import { isActionBlocked } from "./is-action-blocked";
import {
  loadProjectAccessContext,
  userHasAnyProjectManagerAssignment,
} from "./project-access";

export type RequireActionContext = {
  userId: string;
  organizationId?: string | null;
  projectId?: string | null;
  targetUserId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  /**
   * Write an audit_event row for this check. Default true. Read paths (tRPC
   * queries, page guards, permission probes) pass false so that viewing a page
   * never records a mutating action such as `account.delete` or `member.invite`.
   */
  audit?: boolean;
};

export async function requireAction(
  action: ActionName,
  ctx: RequireActionContext,
): Promise<void> {
  const auditEnabled = isActionsAuditEnabled() && ctx.audit !== false;
  const startedAt = Date.now();
  const def = getActionDefinition(action);
  let result: "success" | "denied" | "failure" = "denied";
  let denialReason: string | undefined;

  try {
    if (
      await isActionBlocked(action, {
        userId: ctx.userId,
        organizationId: ctx.organizationId,
        projectId: ctx.projectId,
      })
    ) {
      denialReason = "blocked";
      throw new TRPCError({ code: "FORBIDDEN", message: "Action blocked" });
    }

    if (isPlatformAdmin()) {
      result = "success";
      return;
    }

    if (def.scope === "user") {
      if (def.selfOnly && ctx.targetUserId && ctx.targetUserId !== ctx.userId) {
        denialReason = "not_self";
        throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
      }
      result = "success";
      return;
    }

    if (!ctx.organizationId) {
      denialReason = "no_active_org";
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Select an organization to continue.",
      });
    }

    const [membership] = await db
      .select({ role: member.role })
      .from(member)
      .where(
        activeMemberWhere(
          and(
            eq(member.organizationId, ctx.organizationId),
            eq(member.userId, ctx.userId),
          ),
        ),
      )
      .limit(1);

    const orgRole = normalizeOrgRole(membership?.role);

    const projectCtx = ctx.projectId
      ? await loadProjectAccessContext(ctx.userId, ctx.projectId)
      : null;

    if (
      action === "audit.timeline.view.org" &&
      orgRole === "manager" &&
      ctx.organizationId
    ) {
      const hasAssignment = await userHasAnyProjectManagerAssignment(
        ctx.userId,
        ctx.organizationId,
      );
      if (!hasAssignment) {
        denialReason = "not_project_manager";
        throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
      }
    }

    const decision = evaluatePermission({
      action,
      orgRole,
      project: projectCtx,
    });

    if (!decision.allowed) {
      denialReason = decision.reason;
      throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
    }

    if (
      action === "audit.timeline.view.user" &&
      ctx.targetUserId &&
      ctx.targetUserId !== ctx.userId &&
      orgRole !== "owner"
    ) {
      denialReason = "org_role_denied";
      throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
    }

    result = "success";
  } catch (e) {
    if (!(e instanceof TRPCError)) {
      result = "failure";
    }
    throw e;
  } finally {
    const skipDeniedSelfProbe =
      result === "denied" &&
      def.scope === "user" &&
      def.selfOnly === true;
    if (auditEnabled && !skipDeniedSelfProbe) {
      try {
        await writeAuditEvent({
          action,
          result,
          actorUserId: ctx.userId,
          organizationId: ctx.organizationId,
          projectId: ctx.projectId,
          targetUserId: ctx.targetUserId,
          denialReason,
          durationMs: Date.now() - startedAt,
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
        });
      } catch (auditErr) {
        console.error("audit_event write failed", auditErr);
      }
    }
  }
}
