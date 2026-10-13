import { activeMemberWhere, db } from "@collidr/db";
import { member } from "@collidr/db/schema/organization";
import { isOrganizationsEnabled } from "@collidr/env/organizations";
import { asc, eq } from "drizzle-orm";

/** First org membership for a user, used to seed session.activeOrganizationId on sign-in. */
export async function resolveDefaultActiveOrganizationId(
  userId: string,
): Promise<string | null> {
  if (!isOrganizationsEnabled()) {
    return null;
  }

  const [row] = await db
    .select({ organizationId: member.organizationId })
    .from(member)
    .where(activeMemberWhere(eq(member.userId, userId)))
    .orderBy(asc(member.createdAt))
    .limit(1);

  return row?.organizationId ?? null;
}
