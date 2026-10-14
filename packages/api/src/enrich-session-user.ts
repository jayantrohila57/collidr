import type { AuthSession } from "@collidr/auth/session-types";
import { activeUserWhere, db } from "@collidr/db";
import { user } from "@collidr/db/schema/auth";
import { eq } from "drizzle-orm";

/** Better Auth cookie cache may omit `user.role`; load from DB when missing. */
export async function enrichSessionUserRole(
  session: AuthSession | null,
): Promise<AuthSession | null> {
  if (!session?.user?.id) {
    return session;
  }
  const current = session.user as { role?: string | null };
  if (current.role === "admin" || current.role === "user") {
    return session;
  }
  const [row] = await db
    .select({ role: user.role })
    .from(user)
    .where(activeUserWhere(eq(user.id, session.user.id)))
    .limit(1);
  if (row?.role) {
    Object.assign(session.user, { role: row.role });
  }
  return session;
}
