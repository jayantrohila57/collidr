import { sessionUserIsPlatformAdmin } from "@loftlancer/actions/platform-admin-flag";
import { db } from "@loftlancer/db";
import { platformSupportManager } from "@loftlancer/db/schema/support";
import { eq } from "drizzle-orm";

export async function userIsSupportManager(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ userId: platformSupportManager.userId })
    .from(platformSupportManager)
    .where(eq(platformSupportManager.userId, userId))
    .limit(1);
  return Boolean(row);
}

/** Platform admins (Better Auth `admin` role) have full console support access. */
export async function userHasSupportManagerAccess(
  userId: string,
  user?: { role?: string | null } | null,
): Promise<boolean> {
  if (sessionUserIsPlatformAdmin(user)) {
    return true;
  }
  return userIsSupportManager(userId);
}
