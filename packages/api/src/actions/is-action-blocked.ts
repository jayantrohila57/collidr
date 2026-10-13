import type { ActionName } from "@collidr/actions";
import { db } from "@collidr/db";
import { actionBlock } from "@collidr/db/schema/action-block";
import { and, eq, gt, isNull, or, sql } from "drizzle-orm";

type BlockScope = {
  userId: string;
  organizationId?: string | null;
  projectId?: string | null;
};

export async function isActionBlocked(
  action: ActionName,
  scope: BlockScope,
): Promise<boolean> {
  const now = new Date();
  const rows = await db
    .select({ id: actionBlock.id })
    .from(actionBlock)
    .where(
      and(
        or(eq(actionBlock.action, action), eq(actionBlock.action, "*")),
        or(isNull(actionBlock.expiresAt), gt(actionBlock.expiresAt, now)),
        or(
          and(
            eq(actionBlock.scopeType, "user"),
            eq(actionBlock.scopeId, scope.userId),
          ),
          scope.organizationId
            ? and(
                eq(actionBlock.scopeType, "organization"),
                eq(actionBlock.scopeId, scope.organizationId),
              )
            : sql`false`,
          scope.projectId
            ? and(
                eq(actionBlock.scopeType, "project"),
                eq(actionBlock.scopeId, scope.projectId),
              )
            : sql`false`,
        ),
      ),
    )
    .limit(1);

  return rows.length > 0;
}
