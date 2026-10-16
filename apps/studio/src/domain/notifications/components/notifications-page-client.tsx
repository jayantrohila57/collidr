"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { EmptyState } from "@/components/patterns/empty-state";
import { LoadingButton } from "@/components/patterns/loading-button";
import DashboardSection from "@/components/section-dashboard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";
import { accountSettingsUrl } from "@/lib/account-url";
import { appIcons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  useNotificationMutations,
  useNotificationsList,
  useNotificationsUnreadCount,
} from "../hooks/use-notifications";
import {
  NotificationListItem,
  type NotificationListItemData,
} from "./notification-list-item";

const LIST_MIN_H = "min-h-[22rem]";

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(d: Date, now: Date) {
  const today = dayKey(now);
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (dayKey(d) === today) return "Today";
  if (dayKey(d) === dayKey(y)) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: d.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

/** Newest-first items grouped by local calendar day. */
function groupByDay<T extends NotificationListItemData>(items: T[]) {
  const now = new Date();
  const groups: { key: string; label: string; items: T[] }[] = [];
  for (const item of items) {
    const d = new Date(item.createdAt);
    const key = dayKey(d);
    const last = groups[groups.length - 1];
    if (last?.key === key) last.items.push(item);
    else groups.push({ key, label: dayLabel(d, now), items: [item] });
  }
  return groups;
}

/** Mirrors NotificationListItem: size-8 icon + title line + body line. */
function NotificationRowSkeleton({ width }: { width: string }) {
  return (
    <div className="flex items-start gap-3 px-2 py-2" aria-hidden>
      <Skeleton className="mt-0.5 size-8 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex h-5 items-center">
          <Skeleton className={cn("h-3.5", width)} />
        </span>
        <span className="flex h-4 items-center">
          <Skeleton className="h-3 w-40" />
        </span>
      </div>
      <span className="flex h-5 w-16 shrink-0 items-center justify-end">
        <Skeleton className="h-3 w-10" />
      </span>
    </div>
  );
}

export function NotificationsPageClient() {
  const router = useRouter();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const unreadOnly = tab === "unread";
  const listQuery = useNotificationsList({
    unreadOnly,
    limit: 40,
    poll: true,
  });
  const unreadQuery = useNotificationsUnreadCount();
  const {
    markReadWithToast,
    markAllReadWithToast,
    isMarkingAllRead,
    isMarkingRead,
  } = useNotificationMutations();

  const items = listQuery.data?.data.items ?? [];
  const unreadCount = unreadQuery.data?.data ?? 0;
  const groups = useMemo(() => groupByDay(items), [items]);
  const firstLoad = listQuery.isPending && !listQuery.data;
  const refetching = listQuery.isPlaceholderData;

  return (
    <DashboardSection
      title="Notifications"
      description="Updates about invitations, your organization, and workspace activity."
      back="/dashboard"
      action={
        // Always rendered (disabled at 0) so the header never reflows.
        <LoadingButton
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          loading={isMarkingAllRead}
          loadingLabel="Marking all read"
          disabled={unreadCount === 0}
          onClick={() => void markAllReadWithToast()}
          data-testid="mark-all-read"
        >
          <AppIcon name="markAllRead" className="text-current" />
          Mark all read
        </LoadingButton>
      }
    >
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as "all" | "unread")}
      >
        <TabsList variant="underline" size="sm" className="h-auto w-fit">
          <TabsTab value="all">All</TabsTab>
          <TabsTab value="unread" className="gap-1.5">
            Unread
            <span className="min-w-[3ch] rounded-full border px-1.5 text-center text-[10px] tabular-nums">
              {unreadQuery.data
                ? unreadCount > 99
                  ? "99+"
                  : unreadCount
                : "—"}
            </span>
          </TabsTab>
        </TabsList>
      </Tabs>

      <div
        className={cn(
          "relative mt-4 rounded-xl border border-border/60",
          LIST_MIN_H,
        )}
        aria-busy={firstLoad || refetching || undefined}
        data-testid="notifications-list"
      >
        {firstLoad ? (
          <div className="p-1">
            <span className="sr-only">Loading…</span>
            <Skeleton className="mx-3 my-2 h-3 w-16" />
            {["w-2/3", "w-1/2", "w-3/5", "w-2/5", "w-1/2", "w-3/5"].map(
              (w, i) => (
                <NotificationRowSkeleton key={`${w}-${String(i)}`} width={w} />
              ),
            )}
          </div>
        ) : listQuery.isError ? (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-3 p-6 text-center",
              LIST_MIN_H,
            )}
          >
            <div className="space-y-1">
              <p className="font-medium text-sm">
                Could not load notifications
              </p>
              <p className="text-muted-foreground text-xs">
                Check your connection and try again.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-8"
              onClick={() => void listQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            bare
            className={LIST_MIN_H}
            data-testid="notifications-empty"
            icon={unreadOnly ? appIcons.markAllRead : appIcons.bell}
            title={unreadOnly ? "You're all caught up" : "No notifications yet"}
            description={
              unreadOnly
                ? "There are no unread notifications."
                : "When something needs your attention, it will show up here."
            }
            action={
              unreadOnly ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTab("all")}
                >
                  View all
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  render={
                    <a href={accountSettingsUrl("/settings/notifications")} />
                  }
                >
                  Notification settings
                </Button>
              )
            }
          />
        ) : (
          <div
            className={cn(
              "transition-opacity motion-reduce:transition-none",
              refetching && "opacity-60",
            )}
          >
            {groups.map((g) => (
              <section key={g.key} aria-label={g.label}>
                <h3
                  className="sticky top-0 z-10 border-border/60 border-b bg-background/95 px-3 py-1.5 font-medium text-muted-foreground text-xs backdrop-blur"
                  suppressHydrationWarning
                >
                  {g.label}
                </h3>
                <div
                  role="list"
                  className="flex flex-col divide-y divide-border/60 p-1"
                >
                  {g.items.map((item) => (
                    <NotificationListItem
                      key={item.id}
                      item={item}
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
                      onMarkRead={() => void markReadWithToast({ id: item.id })}
                      disabled={isMarkingRead}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </DashboardSection>
  );
}
