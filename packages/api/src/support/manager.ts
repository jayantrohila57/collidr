import { db } from "@env-manager/db";
import { platformSupportManager } from "@env-manager/db/schema/support";
import { eq } from "drizzle-orm";

export async function userIsSupportManager(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ userId: platformSupportManager.userId })
    .from(platformSupportManager)
    .where(eq(platformSupportManager.userId, userId))
    .limit(1);
  return Boolean(row);
}
