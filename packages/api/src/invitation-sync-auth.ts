import { activeInvitationWhere, activeUserWhere, db } from "@loftlancer/db";
import { user } from "@loftlancer/db/schema/auth";
import { invitation } from "@loftlancer/db/schema/organization";
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { normalizeInviteEmail } from "./invitation-sync-input";

export {
  normalizeInviteEmail,
  organizationIdFromInviteSyncInput,
} from "./invitation-sync-input";

async function getUserEmailNormalized(userId: string): Promise<string | null> {
  const [row] = await db
    .select({ email: user.email })
    .from(user)
    .where(activeUserWhere(eq(user.id, userId)))
    .limit(1);
  if (!row?.email) {
    return null;
  }
  return normalizeInviteEmail(row.email);
}

export async function assertSyncInvitationReceivedAllowed(
  userId: string,
  organizationId: string,
  email: string,
): Promise<void> {
  const normalized = normalizeInviteEmail(email);
  const [invite] = await db
    .select({ id: invitation.id })
    .from(invitation)
    .where(
      activeInvitationWhere(
        and(
          eq(invitation.organizationId, organizationId),
          eq(invitation.inviterId, userId),
          eq(invitation.status, "pending"),
          eq(sql`lower(${invitation.email})`, normalized),
        ),
      ),
    )
    .limit(1);

  if (!invite) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
  }
}

export async function assertSyncInvitationAcceptedAllowed(
  userId: string,
  organizationId: string,
  email: string,
): Promise<void> {
  const normalized = normalizeInviteEmail(email);
  const userEmail = await getUserEmailNormalized(userId);
  if (!userEmail || userEmail !== normalized) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
  }

  const [invite] = await db
    .select({ id: invitation.id })
    .from(invitation)
    .where(
      activeInvitationWhere(
        and(
          eq(invitation.organizationId, organizationId),
          eq(invitation.status, "accepted"),
          eq(sql`lower(${invitation.email})`, normalized),
        ),
      ),
    )
    .limit(1);

  if (!invite) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
  }
}
