import { db } from "@collidr/db";
import { platformSupportManager } from "@collidr/db/schema/support";
import { eq } from "drizzle-orm";

export async function userIsSupportManager(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ userId: platformSupportManager.userId })
    .from(platformSupportManager)
    .where(eq(platformSupportManager.userId, userId))
    .limit(1);
  return Boolean(row);
}
