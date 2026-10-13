import { z } from "zod/v3";

export type NotificationIconName =
  | "invite"
  | "member"
  | "variable"
  | "organization";

export const notificationTypes = [
  "invitation.received",
  "invitation.accepted",
] as const;

export type NotificationType = (typeof notificationTypes)[number];

const invitationReceivedData = z.object({
  organizationId: z.string(),
  organizationName: z.string(),
  invitationId: z.string(),
  inviterName: z.string(),
});

const invitationAcceptedData = z.object({
  organizationId: z.string(),
  organizationName: z.string(),
  invitationId: z.string(),
  memberName: z.string(),
  memberUserId: z.string(),
});

export const notificationDataSchemas: Record<NotificationType, z.ZodTypeAny> = {
  "invitation.received": invitationReceivedData,
  "invitation.accepted": invitationAcceptedData,
};

export type NotificationRenderContext = {
  actorName?: string | null;
};

export type NotificationRenderResult = {
  title: string;
  body: string;
  icon: NotificationIconName;
  href: string;
};

export const notificationRenderers: Record<
  NotificationType,
  (data: unknown, ctx: NotificationRenderContext) => NotificationRenderResult
> = {
  "invitation.received": (raw) => {
    const data = invitationReceivedData.parse(raw);
    return {
      title: "Organization invitation",
      body: `${data.inviterName} invited you to join ${data.organizationName}.`,
      icon: "invite",
      href: "/dashboard/settings/organization",
    };
  },
  "invitation.accepted": (raw) => {
    const data = invitationAcceptedData.parse(raw);
    return {
      title: "Invitation accepted",
      body: `${data.memberName} joined ${data.organizationName}.`,
      icon: "member",
      href: "/dashboard/settings/organization",
    };
  },
};
