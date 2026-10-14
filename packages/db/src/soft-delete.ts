import { isSoftDeletesEnabled } from "@loftlancer/env/soft-deletes";
import { and, eq, inArray, isNull, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

import { db } from "./client";
import { user } from "./schema/auth";
import { notification } from "./schema/notifications";
import { invitation, member, organization } from "./schema/organization";
import { environment, environmentVariable, project } from "./schema/projects";
import {
  supportFaqArticle,
  supportTicket,
  supportTicketMessage,
} from "./schema/support";

export function notDeleted(deletedAtColumn: PgColumn): SQL | undefined {
  if (!isSoftDeletesEnabled()) {
    return undefined;
  }
  return isNull(deletedAtColumn);
}

export function activeProjectWhere(extra?: SQL): SQL {
  return mergeAnd(extra, notDeleted(project.deletedAt)) ?? extra!;
}

export function activeEnvironmentWhere(extra?: SQL): SQL {
  return mergeAnd(extra, notDeleted(environment.deletedAt)) ?? extra!;
}

export function activeEnvironmentVariableWhere(extra?: SQL): SQL {
  return mergeAnd(extra, notDeleted(environmentVariable.deletedAt)) ?? extra!;
}

export function activeOrganizationWhere(extra?: SQL): SQL {
  return mergeAnd(extra, notDeleted(organization.deletedAt)) ?? extra!;
}

export function activeMemberWhere(extra?: SQL): SQL {
  return mergeAnd(extra, notDeleted(member.deletedAt)) ?? extra!;
}

export function activeInvitationWhere(extra?: SQL): SQL {
  return mergeAnd(extra, notDeleted(invitation.deletedAt)) ?? extra!;
}

export function activeUserWhere(extra?: SQL): SQL {
  return mergeAnd(extra, notDeleted(user.deletedAt)) ?? extra!;
}

export function activeNotificationWhere(extra?: SQL): SQL {
  return mergeAnd(extra, notDeleted(notification.deletedAt)) ?? extra!;
}

export function activeSupportTicketWhere(extra?: SQL): SQL {
  return mergeAnd(extra, notDeleted(supportTicket.deletedAt)) ?? extra!;
}

export function activeSupportTicketMessageWhere(extra?: SQL): SQL {
  return mergeAnd(extra, notDeleted(supportTicketMessage.deletedAt)) ?? extra!;
}

export function activeSupportFaqArticleWhere(extra?: SQL): SQL {
  return mergeAnd(extra, notDeleted(supportFaqArticle.deletedAt)) ?? extra!;
}

/** Use with `environment` inner-joined to `project`. */
export function environmentOwnedByUserWhere(userId: string, extra?: SQL): SQL {
  return activeEnvironmentWhere(
    mergeAnd(extra, eq(project.userId, userId), notDeleted(project.deletedAt)),
  )!;
}

/** Use with `environment_variable` → `environment` → `project` joins. */
export function variableOwnedByUserWhere(userId: string, extra?: SQL): SQL {
  return activeEnvironmentVariableWhere(
    mergeAnd(
      extra,
      eq(project.userId, userId),
      notDeleted(environment.deletedAt),
      notDeleted(project.deletedAt),
    ),
  )!;
}

export function mergeAnd(...conditions: (SQL | undefined)[]): SQL | undefined {
  const parts = conditions.filter((c): c is SQL => c !== undefined);
  if (parts.length === 0) {
    return undefined;
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return and(...parts);
}

export function softDeleteSet(deletedByUserId: string) {
  return {
    deletedAt: new Date(),
    deletedBy: deletedByUserId,
  };
}

export async function softDeleteEnvironmentVariablesByEnvironmentIds(
  environmentIds: string[],
  deletedByUserId: string,
): Promise<void> {
  if (environmentIds.length === 0) {
    return;
  }
  if (isSoftDeletesEnabled()) {
    await db
      .update(environmentVariable)
      .set(softDeleteSet(deletedByUserId))
      .where(
        mergeAnd(
          inArray(environmentVariable.environmentId, environmentIds),
          notDeleted(environmentVariable.deletedAt),
        )!,
      );
    return;
  }
  await db
    .delete(environmentVariable)
    .where(inArray(environmentVariable.environmentId, environmentIds));
}

export async function softDeleteEnvironmentsByProjectId(
  projectId: string,
  deletedByUserId: string,
): Promise<void> {
  const envRows = await db
    .select({ id: environment.id })
    .from(environment)
    .where(
      mergeAnd(
        eq(environment.projectId, projectId),
        notDeleted(environment.deletedAt),
      )!,
    );

  const environmentIds = envRows.map((row) => row.id);
  await softDeleteEnvironmentVariablesByEnvironmentIds(
    environmentIds,
    deletedByUserId,
  );

  if (isSoftDeletesEnabled()) {
    await db
      .update(environment)
      .set(softDeleteSet(deletedByUserId))
      .where(
        mergeAnd(
          eq(environment.projectId, projectId),
          notDeleted(environment.deletedAt),
        )!,
      );
    return;
  }
  await db.delete(environment).where(eq(environment.projectId, projectId));
}

export async function softDeleteProjectById(
  projectId: string,
  deletedByUserId: string,
): Promise<void> {
  await softDeleteEnvironmentsByProjectId(projectId, deletedByUserId);

  if (isSoftDeletesEnabled()) {
    await db
      .update(project)
      .set(softDeleteSet(deletedByUserId))
      .where(
        mergeAnd(eq(project.id, projectId), notDeleted(project.deletedAt))!,
      );
    return;
  }
  await db.delete(project).where(eq(project.id, projectId));
}

export async function softDeleteEnvironmentById(
  environmentId: string,
  deletedByUserId: string,
): Promise<void> {
  await softDeleteEnvironmentVariablesByEnvironmentIds(
    [environmentId],
    deletedByUserId,
  );

  if (isSoftDeletesEnabled()) {
    await db
      .update(environment)
      .set(softDeleteSet(deletedByUserId))
      .where(
        mergeAnd(
          eq(environment.id, environmentId),
          notDeleted(environment.deletedAt),
        )!,
      );
    return;
  }
  await db.delete(environment).where(eq(environment.id, environmentId));
}

export async function softDeleteEnvironmentVariableById(
  variableId: string,
  deletedByUserId: string,
): Promise<void> {
  if (isSoftDeletesEnabled()) {
    await db
      .update(environmentVariable)
      .set(softDeleteSet(deletedByUserId))
      .where(
        mergeAnd(
          eq(environmentVariable.id, variableId),
          notDeleted(environmentVariable.deletedAt),
        )!,
      );
    return;
  }
  await db
    .delete(environmentVariable)
    .where(eq(environmentVariable.id, variableId));
}
