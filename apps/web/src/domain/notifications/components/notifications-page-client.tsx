"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DashboardSection from "@/components/section-dashboard";
import { Button } from "@/components/ui/button";
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
  const listQuery = useNotificationsList({ unreadOnly, limit: 40 });
  const unreadQuery = useNotificationsUnreadCount();
  const { markRead, markAllRead } = useNotificationMutations();

  const items = listQuery.data?.data.items ?? [];
  const unreadCount = unreadQuery.data?.data ?? 0;

  return (
    <DashboardSection
      title="Notifications"
      description="Updates about invitations, your organization, and workspace activity."
      back="/dashboard"
      action={
        unreadCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={markAllRead.isPending}
            onClick={() => void markAllRead.mutateAsync()}
          >
            Mark all read
          </Button>
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
                        await markRead.mutateAsync({ id: item.id });
                      }
                      router.push(item.href as Route);
                    })();
                  }}
                />
              ))}
            </div>
          )}
        </TabsPanel>
      </Tabs>
    </DashboardSection>
  );
}
