"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoadingButton } from "@/components/patterns/loading-button";
import DashboardSection from "@/components/section-dashboard";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import {
  useNotificationMutations,
  useNotificationsList,
  useNotificationsUnreadCount,
} from "../hooks/use-notifications";
import { NotificationListItem } from "./notification-list-item";

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

  return (
    <DashboardSection
      title="Notifications"
      description="Updates about invitations, your organization, and workspace activity."
      back="/dashboard"
      action={
        unreadCount > 0 ? (
          <LoadingButton
            type="button"
            variant="outline"
            size="sm"
            className="max-sm:px-2.5"
            loading={isMarkingAllRead}
            loadingLabel="Updating…"
            onClick={() => void markAllReadWithToast()}
          >
            <span className="sm:hidden">Read all</span>
            <span className="hidden sm:inline">Mark all read</span>
          </LoadingButton>
        ) : null
      }
    >
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as "all" | "unread")}
      >
        <TabsList variant="underline" size="sm" className="h-auto w-fit">
          <TabsTab value="all">All</TabsTab>
          <TabsTab value="unread">Unread</TabsTab>
        </TabsList>
        <TabsPanel value={tab} className="mt-4">
          {listQuery.isLoading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : listQuery.isError ? (
            <div className="rounded-lg border border-dashed px-4 py-12 text-center">
              <p className="font-medium text-sm">
                Could not load notifications
              </p>
              <p className="mt-1 text-muted-foreground text-sm">
                Refresh the page or try again in a moment.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-12 text-center">
              <p className="font-medium text-sm">
                {unreadOnly
                  ? "No unread notifications"
                  : "No notifications yet"}
              </p>
              <p className="mt-1 text-muted-foreground text-sm">
                {unreadOnly
                  ? "You are all caught up."
                  : "When something needs your attention, it will show up here."}
              </p>
            </div>
          ) : (
            <div className="divide-y rounded-lg border">
              {items.map((item) => (
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
                  disabled={isMarkingRead}
                />
              ))}
            </div>
          )}
        </TabsPanel>
      </Tabs>
    </DashboardSection>
  );
}
