import { sessionUserIsPlatformAdmin } from "@loftlancer/actions/platform-admin-flag";
import { activeSupportTicketWhere, db } from "@loftlancer/db";
import { supportTicket } from "@loftlancer/db/schema/support";
import { eq } from "drizzle-orm";
import { requireAction } from "../actions/require-action";
import { runWithPlatformAdminContext } from "../platform-admin-context";
import { userHasSupportManagerAccess } from "../support/manager";
import {
  canReadTicket,
  type SupportAccessContext,
} from "../support/permissions";
import { PageForbiddenError, PageNotFoundError } from "./errors";

async function loadSupportAccess(
  userId: string,
  user?: { role?: string | null } | null,
): Promise<SupportAccessContext> {
  return {
    userId,
    isSupportManager: await userHasSupportManagerAccess(userId, user),
  };
}

export async function requireSupportManagerPage(
  userId: string,
  user?: { role?: string | null } | null,
): Promise<void> {
  const platformAdmin = sessionUserIsPlatformAdmin(user);
  await runWithPlatformAdminContext(platformAdmin, async () => {
    const access = await loadSupportAccess(userId, user);
    if (!access.isSupportManager) {
      throw new PageForbiddenError("Support manager access required");
    }
    await requireAction("support.ticket.assign", { userId });
  });
}

export async function requireSupportTicketPage(
  userId: string,
  ticketId: string,
  user?: { role?: string | null } | null,
): Promise<void> {
  const platformAdmin = sessionUserIsPlatformAdmin(user);
  await runWithPlatformAdminContext(platformAdmin, async () => {
    await requireAction("support.ticket.read", { userId });

    const [row] = await db
      .select({
        requesterUserId: supportTicket.requesterUserId,
        status: supportTicket.status,
      })
      .from(supportTicket)
      .where(activeSupportTicketWhere(eq(supportTicket.id, ticketId)))
      .limit(1);

    if (!row) {
      throw new PageNotFoundError("Ticket not found");
    }

    const access = await loadSupportAccess(userId, user);
    if (!canReadTicket(access, row)) {
      throw new PageNotFoundError("Ticket not found");
    }
  });
}
