import {
  evaluatePermission,
  isActionsAuditEnabled,
  normalizeOrgRole,
} from "@env-manager/actions";
import { db } from "@env-manager/db";
import { member } from "@env-manager/db/schema/organization";
import { project } from "@env-manager/db/schema/projects";
import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { loadProjectAccessContext } from "./actions/project-access";

type SessionLike = {
  user: { id: string };
  session: { activeOrganizationId?: string | null };
};

export function getActiveOrganizationId(ctx: SessionLike): string | null {
  return ctx.session.activeOrganizationId ?? null;
}

export async function requireActiveOrganization(
  ctx: SessionLike,
): Promise<string> {
  if (!isOrganizationsEnabled()) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Organizations are not enabled.",
    });
  }

  const organizationId = getActiveOrganizationId(ctx);
  if (!organizationId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Select or create an organization to continue.",
    });
  }

  const membership = await db
    .select({ id: member.id, role: member.role })
    .from(member)
    .where(
      and(
        eq(member.organizationId, organizationId),
        eq(member.userId, ctx.user.id),
      ),
    )
    .limit(1);

  if (!membership.length) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not a member of this organization.",
    });
  }

  return organizationId;
}

export function projectListFilter(
  userId: string,
  organizationId: string | null,
) {
  if (isOrganizationsEnabled() && organizationId) {
    return and(
      eq(project.userId, userId),
      eq(project.organizationId, organizationId),
      isNull(project.deletedAt),
    );
  }
  return and(eq(project.userId, userId), isNull(project.deletedAt));
}

export async function resolveOrgContext(auth: SessionLike) {
  const userId = auth.user.id;
  if (!isOrganizationsEnabled()) {
    return { userId, organizationId: null as string | null };
  }
  const organizationId = await requireActiveOrganization(auth);
  return { userId, organizationId };
}

export async function attachProjectToOrganization(
  projectId: string,
  organizationId: string,
) {
  if (!isOrganizationsEnabled()) return;
  await db
    .update(project)
    .set({ organizationId })
    .where(and(eq(project.id, projectId), isNull(project.organizationId)));
}

export async function assertProjectAccess(
  userId: string,
  projectId: string,
  organizationId: string | null,
) {
  if (isActionsAuditEnabled() && organizationId) {
    const [proj] = await db
      .select({ id: project.id })
      .from(project)
      .where(
        and(
          eq(project.id, projectId),
          eq(project.organizationId, organizationId),
          isNull(project.deletedAt),
        ),
      )
      .limit(1);

    if (!proj) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    const [membership] = await db
      .select({ role: member.role })
      .from(member)
      .where(
        and(
          eq(member.organizationId, organizationId),
          eq(member.userId, userId),
        ),
      )
      .limit(1);

    const orgRole = normalizeOrgRole(membership?.role);
    const projectCtx = await loadProjectAccessContext(userId, projectId);
    const decision = evaluatePermission({
      action: "project.read",
      orgRole,
      project: projectCtx,
    });

    if (!decision.allowed) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }
    return;
  }

  const rows = await db
    .select({ id: project.id })
    .from(project)
    .where(
      isOrganizationsEnabled() && organizationId
        ? and(
            eq(project.id, projectId),
            eq(project.userId, userId),
            eq(project.organizationId, organizationId),
            isNull(project.deletedAt),
          )
        : and(
            eq(project.id, projectId),
            eq(project.userId, userId),
            isNull(project.deletedAt),
          ),
    )
    .limit(1);

  if (!rows.length) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Project not found",
    });
  }
}
