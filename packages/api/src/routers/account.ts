import { isActionsAuditEnabled } from "@env-manager/actions";
import { db } from "@env-manager/db";
import { auditEvent } from "@env-manager/db/schema/audit-event";
import { user } from "@env-manager/db/schema/auth";
import { notification } from "@env-manager/db/schema/notifications";
import { member } from "@env-manager/db/schema/organization";
import { project } from "@env-manager/db/schema/projects";
import { eq } from "drizzle-orm";
import { requireAction } from "../actions/require-action";
import { protectedProcedure, router } from "../index";

export const accountRouter = router({
  exportData: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    if (isActionsAuditEnabled()) {
      await requireAction("account.export", { userId });
    }

    const [profile] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    const memberships = await db
      .select()
      .from(member)
      .where(eq(member.userId, userId));

    const projects = await db
      .select()
      .from(project)
      .where(eq(project.userId, userId));

    const notifications = await db
      .select()
      .from(notification)
      .where(eq(notification.recipientUserId, userId));

    const events = await db
      .select()
      .from(auditEvent)
      .where(eq(auditEvent.actorUserId, userId))
      .limit(1000);

    return {
      exportedAt: new Date().toISOString(),
      profile,
      memberships,
      projects,
      notifications,
      auditEvents: events,
    };
  }),
});
