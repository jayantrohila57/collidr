"use client";

import { AppIcon } from "@/components/patterns/app-icon";
import { ClientRelativeTime } from "@/components/patterns/client-relative-time";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { AppIconName } from "@/lib/icons";
import { cn } from "@/lib/utils";

export type NotificationListItemData = {
  id: string;
  title: string;
  body: string;
  readAt: Date | string | null;
  createdAt: Date | string;
  icon: string;
  actorUser?: {
    id: string;
    name: string;
    image?: string | null;
  } | null;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function resolveIcon(icon: string): AppIconName {
  if (icon === "invite" || icon === "member" || icon === "variable") {
    return icon;
  }
  return "organization";
}

export function NotificationListItem({
  item,
  onClick,
  compact = false,
  disabled = false,
}: {
  item: NotificationListItemData;
  onClick?: () => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  const unread = !item.readAt;

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative isolate box-border h-auto w-full min-w-0 shrink-0 items-start justify-start gap-3 overflow-hidden whitespace-normal rounded-md px-2 text-start font-normal",
        compact ? "py-3" : "py-2.5",
        unread && "bg-muted/30",
      )}
    >
      <span className="relative mt-0.5 shrink-0 self-start">
        <span className="flex size-8 items-center justify-center rounded-full border bg-card">
          <AppIcon name={resolveIcon(item.icon)} className="size-4" />
        </span>
        {unread ? (
          <span
            className="absolute -end-0.5 -top-0.5 size-2 rounded-full bg-destructive"
            aria-hidden
          />
        ) : null}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-start justify-between gap-2">
          <span className="line-clamp-2 font-medium text-sm leading-snug">
            {item.title}
          </span>
          <span className="shrink-0 text-muted-foreground text-xs leading-snug">
            <ClientRelativeTime value={item.createdAt} />
          </span>
        </span>
        <span className="line-clamp-2 text-muted-foreground text-xs leading-snug">
          {item.body}
        </span>
        {item.actorUser ? (
          <span className="flex items-center gap-1.5 text-muted-foreground text-xs leading-snug">
            <Avatar className="size-4 shrink-0">
              {item.actorUser.image ? (
                <AvatarImage src={item.actorUser.image} alt="" />
              ) : null}
              <AvatarFallback className="text-[8px]">
                {initials(item.actorUser.name)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{item.actorUser.name}</span>
          </span>
        ) : null}
      </span>
    </Button>
  );
}
