"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppIcon } from "@/components/patterns/app-icon";
import { LoadingButton } from "@/components/patterns/loading-button";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import { isNotificationsEnabledOnClient } from "@/lib/notifications-enabled";
import {
  useNotificationMutations,
  useNotificationsList,
  useNotificationsUnreadCount,
} from "../hooks/use-notifications";
import { NotificationListItem } from "./notification-list-item";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }
  const label = count > 99 ? "99+" : String(count);
  return (
    <span
      className="absolute -end-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 font-medium text-[10px] text-destructive-foreground leading-none"
      aria-hidden
    >
      {label}
    </span>
  );
}

export function NotificationBell() {
  const router = useRouter();
  const enabled = isNotificationsEnabledOnClient();
  const unreadQuery = useNotificationsUnreadCount();
  const listQuery = useNotificationsList({ limit: 10, poll: true });
  const {
    markReadWithToast,
    markAllReadWithToast,
    isMarkingAllRead,
    isMarkingRead,
  } = useNotificationMutations();

  if (!enabled) {
    return null;
  }

  const unread = unreadQuery.data?.data ?? 0;
  const items = listQuery.data?.data.items ?? [];

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="relative size-8"
            aria-label={
              unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
            }
          />
        }
      >
        <AppIcon name="bell" className="text-foreground" />
        <CountBadge count={unread} />
      </MenuTrigger>
      <MenuPopup align="end" className="w-[min(100vw-2rem,22rem)] p-2">
        <div className="flex items-center justify-between gap-2 px-1 pb-2">
          <span className="font-medium text-sm">Notifications</span>
          {unread > 0 ? (
            <LoadingButton
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              loading={isMarkingAllRead}
              loadingLabel="Updating…"
              onClick={() => void markAllReadWithToast()}
            >
              Mark all read
            </LoadingButton>
          ) : null}
        </div>
        <div className="flex max-h-80 flex-col gap-1 overflow-y-auto overflow-x-hidden">
          {listQuery.isError ? (
            <p className="px-2 py-6 text-center text-muted-foreground text-sm">
              Could not load notifications. Try again shortly.
            </p>
          ) : listQuery.isLoading ? (
            <p className="px-2 py-6 text-center text-muted-foreground text-sm">
              Loading…
            </p>
          ) : items.length === 0 ? (
            <p className="px-2 py-6 text-center text-muted-foreground text-sm">
              {unread > 0
                ? "Unread notifications could not be displayed."
                : "No notifications yet."}
            </p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="w-full shrink-0 border-border/60 border-b last:border-b-0">
                <NotificationListItem
                  item={item}
                  compact
                  onClick={() => {
                  void (async () => {
                    if (!item.readAt) {
                      try {
                        await markReadWithToast({ id: item.id });
                      } catch {
                        return;
                      }
                    }
                    router.push(item.href as Route);
                  })();
                }}
                  disabled={isMarkingRead}
                />
              </div>
            ))
          )}
        </div>
        <MenuSeparator />
        <MenuItem render={<Link href={"/dashboard/notifications" as Route} />}>
          View all
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
}
