import {
  type ActionName,
  actionNames,
  evaluatePermission,
  normalizeOrgRole,
} from "@collidr/actions";
import { db } from "@collidr/db";
import { member } from "@collidr/db/schema/organization";
import { and, eq } from "drizzle-orm";
import { isActionBlocked } from "./is-action-blocked";
import {
  loadProjectAccessContext,
  userHasAnyProjectManagerAssignment,
} from "./project-access";

export type PermissionsSnapshot = {
  platformAdmin: false;
  orgRole: "owner" | "manager" | "member" | null;
  /** Org member with no manager assignment and no team/project grants. */
  unassignedMember: boolean;
  actions: Record<string, boolean>;
  blocked: ActionName[];
};

export async function buildPermissionsSnapshot(input: {
  userId: string;
  organizationId: string | null;
  projectId?: string | null;
}): Promise<PermissionsSnapshot> {
  const blocked: ActionName[] = [];
  const actions: Record<string, boolean> = {};

  let orgRole: "owner" | "manager" | "member" | null = null;
  if (input.organizationId) {
    const [membership] = await db
      .select({ role: member.role })
      .from(member)
      .where(
        and(
          eq(member.organizationId, input.organizationId),
          eq(member.userId, input.userId),
        ),
      )
      .limit(1);
    orgRole = normalizeOrgRole(membership?.role);
  }

  const projectCtx = input.projectId
    ? await loadProjectAccessContext(input.userId, input.projectId)
    : null;

  let managerHasTimeline = false;
  let unassignedMember = false;
  if (orgRole === "manager" && input.organizationId) {
    managerHasTimeline = await userHasAnyProjectManagerAssignment(
      input.userId,
      input.organizationId,
    );
  }
  if (orgRole === "member" && input.organizationId) {
    const accessible = await import("../project-list").then((m) =>
      m.listAccessibleProjectIds(input.userId, input.organizationId),
    );
    unassignedMember = (accessible?.length ?? 0) === 0;
  }

  for (const name of actionNames) {
    const action = name as ActionName;
    if (
      await isActionBlocked(action, {
        userId: input.userId,
        organizationId: input.organizationId,
        projectId: input.projectId,
      })
    ) {
      blocked.push(action);
      actions[name] = false;
      continue;
    }

    const defScope = evaluatePermission({
      action,
      orgRole,
      project: projectCtx,
    });

    if (
      action === "audit.timeline.view.org" &&
      orgRole === "manager" &&
      !managerHasTimeline
    ) {
      actions[name] = false;
      continue;
    }

    actions[name] = defScope.allowed;
  }

  return {
    platformAdmin: false,
    orgRole,
    unassignedMember,
    actions,
    blocked,
  };
}
