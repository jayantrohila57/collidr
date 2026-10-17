import { activeNotificationWhere, db } from "@loftlancer/db";
import { notification } from "@loftlancer/db/schema/notifications";
import { and, eq, isNull, sql } from "drizzle-orm";
import { isNotificationsEnabled } from "./feature";
import {
  type NotificationType,
  notificationDataSchemas,
  notificationRenderers,
} from "./registry";

export type NotifyRecipient = {
  userId?: string;
  email?: string;
};

export type NotifyInput = {
  type: NotificationType;
  recipients: NotifyRecipient[];
  actorUserId?: string | null;
  organizationId?: string | null;
  entity?: { type: string; id: string };
  data: unknown;
  idempotencyKey?: string;
  actorName?: string | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function notify(input: NotifyInput): Promise<number> {
  if (!isNotificationsEnabled()) {
    return 0;
  }

  const schema = notificationDataSchemas[input.type];
  const parsedData = schema.parse(input.data);
  const rendered = notificationRenderers[input.type](parsedData, {
    actorName: input.actorName,
  });

  const rows = input.recipients
    .map((recipient) => {
      const userId = recipient.userId?.trim() || null;
      const email = recipient.email ? normalizeEmail(recipient.email) : null;
      if (!userId && !email) {
        return null;
      }
      return {
        id: crypto.randomUUID(),
        recipientUserId: userId,
        recipientEmail: userId ? null : email,
        organizationId: input.organizationId ?? null,
        type: input.type,
        actorUserId: input.actorUserId ?? null,
        entityType: input.entity?.type ?? null,
        entityId: input.entity?.id ?? null,
        data: parsedData,
        title: rendered.title,
        body: rendered.body,
        idempotencyKey: input.idempotencyKey ?? null,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length === 0) {
    return 0;
  }

  let created = 0;
  for (const row of rows) {
    if (row.idempotencyKey) {
      const existing = await db
        .select({ id: notification.id })
        .from(notification)
        .where(
          activeNotificationWhere(
            row.recipientUserId
              ? and(
                  eq(notification.recipientUserId, row.recipientUserId),
                  eq(notification.idempotencyKey, row.idempotencyKey),
                )
              : and(
                  eq(notification.recipientEmail, row.recipientEmail ?? ""),
                  eq(notification.idempotencyKey, row.idempotencyKey),
                ),
          ),
        )
        .limit(1);
      if (existing.length > 0) {
        continue;
      }
    }

    await db.insert(notification).values(row);
    created++;
  }

  return created;
}

export async function linkPendingNotificationsForUser(
  userId: string,
  email: string,
) {
  if (!isNotificationsEnabled()) {
    return;
  }

  const normalized = normalizeEmail(email);
  await db
    .update(notification)
    .set({
      recipientUserId: userId,
      recipientEmail: null,
    })
    .where(
      and(
        isNull(notification.recipientUserId),
        eq(sql`lower(${notification.recipientEmail})`, normalized),
      ),
    );
}
