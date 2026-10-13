"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isNotificationsEnabledOnClient } from "@/lib/notifications-enabled";
import { trpc } from "@/utils/trpc";

const POLL_MS = 20_000;

export function useNotificationsUnreadCount() {
  const enabled = isNotificationsEnabledOnClient();
  return useQuery({
    ...trpc.notifications.unreadCount.queryOptions(),
    enabled,
    refetchInterval: (query) => {
      if (typeof document !== "undefined" && document.hidden) {
        return false;
      }
      return query.state.status === "error" ? false : POLL_MS;
    },
    refetchOnWindowFocus: true,
  });
}

export function useNotificationsList(options?: {
  unreadOnly?: boolean;
  limit?: number;
}) {
  const enabled = isNotificationsEnabledOnClient();
  return useQuery({
    ...trpc.notifications.list.queryOptions({
      limit: options?.limit ?? 15,
      unreadOnly: options?.unreadOnly,
    }),
    enabled,
    refetchOnWindowFocus: true,
  });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: trpc.notifications.unreadCount.queryKey(),
    });
    void queryClient.invalidateQueries({
      queryKey: trpc.notifications.list.queryKey(),
    });
  };

  const markRead = useMutation(
    trpc.notifications.markRead.mutationOptions({
      onSuccess: invalidate,
    }),
  );

  const markAllRead = useMutation(
    trpc.notifications.markAllRead.mutationOptions({
      onSuccess: invalidate,
    }),
  );

  const syncInvitationReceived = useMutation(
    trpc.notifications.syncInvitationReceived.mutationOptions(),
  );

  const syncInvitationAccepted = useMutation(
    trpc.notifications.syncInvitationAccepted.mutationOptions({
      onSuccess: invalidate,
    }),
  );

  return {
    markRead,
    markAllRead,
    syncInvitationReceived,
    syncInvitationAccepted,
  };
}
