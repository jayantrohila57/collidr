import {
  type NotificationIconName,
  type NotificationType,
  notificationDataSchemas,
  notificationRenderers,
} from "./registry";

export type NotificationListPresentation = {
  title: string;
  body: string;
  icon: NotificationIconName;
  href: string;
};

const defaultPresentation = (fallback: {
  title?: string | null;
  body?: string | null;
}): NotificationListPresentation => ({
  title: fallback.title?.trim() || "Notification",
  body: fallback.body?.trim() || "",
  icon: "organization",
  href: "/dashboard/notifications",
});

/**
 * Renders notification UI fields for list/bell views. Never throws: malformed or
 * unknown types fall back to stored title/body so list queries stay consistent
 * with unread counts.
 */
export function resolveNotificationPresentation(
  type: string,
  data: unknown,
  fallback: { title?: string | null; body?: string | null },
): NotificationListPresentation {
  if (!(type in notificationRenderers)) {
    return defaultPresentation(fallback);
  }

  const notificationType = type as NotificationType;
  const parsed = notificationDataSchemas[notificationType].safeParse(data);
  if (!parsed.success) {
    return defaultPresentation(fallback);
  }

  try {
    return notificationRenderers[notificationType](parsed.data, {});
  } catch {
    return defaultPresentation(fallback);
  }
}
