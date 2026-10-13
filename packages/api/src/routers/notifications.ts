import { activeNotificationWhere, db } from "@env-manager/db";
import { user } from "@env-manager/db/schema/auth";
import { notification } from "@env-manager/db/schema/notifications";
import {
  isNotificationsEnabled,
  resolveNotificationPresentation,
  syncInvitationAcceptedByEmail,
  syncInvitationReceivedByEmail,
} from "@env-manager/notifications";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull, lt, or, sql } from "drizzle-orm";
import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
import { protectedProcedure, router } from "../index";
import {
  assertSyncInvitationAcceptedAllowed,
  assertSyncInvitationReceivedAllowed,
  organizationIdFromInviteSyncInput,
} from "../invitation-sync-auth";
import {
  makeResponseSchema,
  notificationListItemOutput,
  respond,
} from "../validation";

function assertNotificationsEnabled() {
  if (!isNotificationsEnabled()) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Notifications are not enabled on this server.",
    });
  }
}

function recipientNotificationConditions(
  userId: string,
  options?: {
    unreadOnly?: boolean;
    cursor?: { createdAt: Date; id: string };
  },
) {
  const conditions = [
    activeNotificationWhere(eq(notification.recipientUserId, userId)),
  ];
  if (options?.unreadOnly) {
    conditions.push(isNull(notification.readAt));
  }
  if (options?.cursor) {
    const cursorCondition = or(
      lt(notification.createdAt, options.cursor.createdAt),
      and(
        eq(notification.createdAt, options.cursor.createdAt),
        lt(notification.id, options.cursor.id),
      ),
    );
    if (cursorCondition) {
      conditions.push(cursorCondition);
    }
  }
  return and(...conditions.filter(Boolean));
}

export const notificationsRouter = router({
  unreadCount: protectedProcedure
    .use(actionGuard("notification.list"))
    .output(makeResponseSchema(z.number()))
    .query(async ({ ctx }) => {
      if (!isNotificationsEnabled()) {
        return respond({ message: "Count fetched", data: 0 });
      }

      const [row] = await db
        .select({ total: sql<number>`count(*)::int` })
        .from(notification)
        .where(
          recipientNotificationConditions(ctx.session.user.id, {
            unreadOnly: true,
          }),
        );

      return respond({ message: "Count fetched", data: row?.total ?? 0 });
    }),

  list: protectedProcedure
    .use(actionGuard("notification.list"))
    .input(
      z.object({
        cursor: z
          .object({
            createdAt: z.coerce.date(),
            id: z.string(),
          })
          .optional(),
        limit: z.number().min(1).max(50).default(20),
        unreadOnly: z.boolean().optional(),
      }),
    )
    .output(
      makeResponseSchema(
        z.object({
          items: z.array(notificationListItemOutput),
          nextCursor: z
            .object({
              createdAt: z.date(),
              id: z.string(),
            })
            .nullable(),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      if (!isNotificationsEnabled()) {
        return respond({
          message: "Notifications fetched",
          data: { items: [], nextCursor: null },
        });
      }

      const userId = ctx.session.user.id;

      const rows = await db
        .select({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          data: notification.data,
          readAt: notification.readAt,
          createdAt: notification.createdAt,
          actorUserId: notification.actorUserId,
          actorName: user.name,
          actorImage: user.image,
        })
        .from(notification)
        .leftJoin(user, eq(notification.actorUserId, user.id))
        .where(
          recipientNotificationConditions(userId, {
            unreadOnly: input.unreadOnly,
            cursor: input.cursor,
          }),
        )
        .orderBy(desc(notification.createdAt), desc(notification.id))
        .limit(input.limit + 1);

      const hasMore = rows.length > input.limit;
      const page = hasMore ? rows.slice(0, input.limit) : rows;
      const last = page[page.length - 1];

      const items = page.map((row) => {
        const presentation = resolveNotificationPresentation(
          row.type,
          row.data,
          { title: row.title, body: row.body },
        );
        return {
          id: row.id,
          type: row.type,
          title: presentation.title,
          body: presentation.body,
          readAt: row.readAt,
          createdAt: row.createdAt,
          href: presentation.href,
          icon: presentation.icon,
          actorUser: row.actorUserId
            ? {
                id: row.actorUserId,
                name: row.actorName ?? "Someone",
                image: row.actorImage,
              }
            : null,
        };
      });

      return respond({
        message: "Notifications fetched",
        data: {
          items,
          nextCursor:
            hasMore && last ? { createdAt: last.createdAt, id: last.id } : null,
        },
      });
    }),

  markRead: protectedProcedure
    .use(actionGuard("notification.mark_read"))
    .input(z.object({ id: z.string() }))
    .output(makeResponseSchema(z.boolean()))
    .mutation(async ({ ctx, input }) => {
      assertNotificationsEnabled();
      const [updated] = await db
        .update(notification)
        .set({ readAt: new Date() })
        .where(
          activeNotificationWhere(
            and(
              eq(notification.id, input.id),
              eq(notification.recipientUserId, ctx.session.user.id),
            ),
          ),
        )
        .returning({ id: notification.id });

      return respond({ message: "Marked read", data: Boolean(updated) });
    }),

  markUnread: protectedProcedure
    .use(actionGuard("notification.mark_unread"))
    .input(z.object({ id: z.string() }))
    .output(makeResponseSchema(z.boolean()))
    .mutation(async ({ ctx, input }) => {
      assertNotificationsEnabled();
      const [updated] = await db
        .update(notification)
        .set({ readAt: null })
        .where(
          activeNotificationWhere(
            and(
              eq(notification.id, input.id),
              eq(notification.recipientUserId, ctx.session.user.id),
            ),
          ),
        )
        .returning({ id: notification.id });

      return respond({ message: "Marked unread", data: Boolean(updated) });
    }),

  markAllRead: protectedProcedure
    .use(actionGuard("notification.mark_read"))
    .output(makeResponseSchema(z.number()))
    .mutation(async ({ ctx }) => {
      assertNotificationsEnabled();
      const updated = await db
        .update(notification)
        .set({ readAt: new Date() })
        .where(
          activeNotificationWhere(
            and(
              eq(notification.recipientUserId, ctx.session.user.id),
              isNull(notification.readAt),
            ),
          ),
        )
        .returning({ id: notification.id });

      return respond({
        message: "Marked all read",
        data: updated.length,
      });
    }),

  syncInvitationReceived: protectedProcedure
    .use(actionGuard("member.invite", organizationIdFromInviteSyncInput))
    .input(
      z.object({
        organizationId: z.string(),
        email: z.string().email(),
      }),
    )
    .output(makeResponseSchema(z.boolean()))
    .mutation(async ({ ctx, input }) => {
      assertNotificationsEnabled();
      await assertSyncInvitationReceivedAllowed(
        ctx.session.user.id,
        input.organizationId,
        input.email,
      );
      await syncInvitationReceivedByEmail(
        input.organizationId,
        input.email,
        ctx.session.user.id,
      );
      return respond({ message: "Synced", data: true });
    }),

  syncInvitationAccepted: protectedProcedure
    .use(actionGuard("invitation.accept", organizationIdFromInviteSyncInput))
    .input(
      z.object({
        organizationId: z.string(),
        email: z.string().email(),
      }),
    )
    .output(makeResponseSchema(z.boolean()))
    .mutation(async ({ ctx, input }) => {
      assertNotificationsEnabled();
      await assertSyncInvitationAcceptedAllowed(
        ctx.session.user.id,
        input.organizationId,
        input.email,
      );
      await syncInvitationAcceptedByEmail(input.organizationId, input.email);
      return respond({ message: "Synced", data: true });
    }),
});
