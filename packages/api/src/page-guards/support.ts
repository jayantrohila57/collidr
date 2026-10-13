import { activeSupportTicketWhere, db } from "@env-manager/db";
import { supportTicket } from "@env-manager/db/schema/support";
import { eq } from "drizzle-orm";
import { requireAction } from "../actions/require-action";
import { userIsSupportManager } from "../support/manager";
import {
  canReadTicket,
  type SupportAccessContext,
} from "../support/permissions";
import { PageForbiddenError, PageNotFoundError } from "./errors";

async function loadSupportAccess(
  userId: string,
): Promise<SupportAccessContext> {
  return {
    userId,
    isSupportManager: await userIsSupportManager(userId),
  };
}

export async function requireSupportManagerPage(userId: string): Promise<void> {
  const access = await loadSupportAccess(userId);
  if (!access.isSupportManager) {
    throw new PageForbiddenError("Support manager access required");
  }
  await requireAction("support.ticket.assign", { userId });
}

export async function requireSupportTicketPage(
  userId: string,
  ticketId: string,
): Promise<void> {
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

  const access = await loadSupportAccess(userId);
  if (!canReadTicket(access, row)) {
    throw new PageNotFoundError("Ticket not found");
  }
}
