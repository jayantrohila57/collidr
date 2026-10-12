"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  useActiveOrganization,
  useOrgQueryScopeKey,
} from "@/components/org/active-organization-context";
import { trpc } from "@/utils/trpc";

// Interface for dashboard stats response
interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalEnvironments: number;
  activeEnvironments: number;
  totalVariables: number;
  productionEnvironments: number;
  recentAuditLogs: number;
  projectsByStatus: Record<string, number>;
  environmentsByStatus: Record<string, number>;
}

// Interface for recent activity response
interface RecentActivity {
  recentProjects: Array<{
    id: string;
    name: string;
    slug: string;
    status: "active" | "inactive" | "maintenance";
    createdAt: string;
  }>;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    entityType: string;
    entitySlug: string | null;
    createdAt: string;
  }>;
}

const DASHBOARD_LOAD_TIMEOUT_MS = 20_000;

export function useDashboardStats() {
  const orgScope = useOrgQueryScopeKey();
  const { isSwitching } = useActiveOrganization();
  const queryClient = useQueryClient();
  const [loadTimedOut, setLoadTimedOut] = useState(false);

  useEffect(() => {
    queryClient.removeQueries({
      queryKey: trpc.dashboard.getStats.queryKey(),
    });
  }, [orgScope, queryClient]);

  const statsQuery = useQuery({
    ...trpc.dashboard.getStats.queryOptions(),
    meta: { toastOnError: false },
    retry: 2,
  });

  const pending = isSwitching || statsQuery.isLoading || statsQuery.isFetching;
  const stats = pending
    ? undefined
    : (statsQuery.data as DashboardStats | undefined);

  useEffect(() => {
    if (!pending) {
      setLoadTimedOut(false);
      return;
    }
    const timer = window.setTimeout(
      () => setLoadTimedOut(true),
      DASHBOARD_LOAD_TIMEOUT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [pending]);

  const status: "loading" | "error" | "empty" | "success" = loadTimedOut
    ? "error"
    : pending
      ? "loading"
      : statsQuery.isError
        ? "error"
        : stats
          ? "success"
          : "empty";

  return {
    stats,
    status,
    error: statsQuery.error,
    isLoading: pending,
    refetch: statsQuery.refetch,
  };
}

export function useDashboardActivity() {
  const orgScope = useOrgQueryScopeKey();
  const { isSwitching } = useActiveOrganization();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.removeQueries({
      queryKey: trpc.dashboard.getRecentActivity.queryKey(),
    });
  }, [orgScope, queryClient]);

  const activityQuery = useQuery({
    ...trpc.dashboard.getRecentActivity.queryOptions(),
    meta: { toastOnError: false },
  });

  const pending =
    isSwitching || activityQuery.isLoading || activityQuery.isFetching;
  const activity = pending
    ? undefined
    : (activityQuery.data as RecentActivity | undefined);

  const status: "loading" | "error" | "empty" | "success" = pending
    ? "loading"
    : activityQuery.isError
      ? "error"
      : activity
        ? "success"
        : "empty";

  return {
    activity,
    status,
    error: activityQuery.error,
    isLoading: pending,
    refetch: activityQuery.refetch,
  };
}

// Combined hook for convenience
export function useDashboard() {
  const stats = useDashboardStats();
  const activity = useDashboardActivity();

  const isLoading = stats.isLoading || activity.isLoading;
  const hasError = stats.error || activity.error;

  const status: "loading" | "error" | "empty" | "success" = isLoading
    ? "loading"
    : hasError
      ? "error"
      : !stats.stats && !activity.activity
        ? "empty"
        : "success";

  const refetchAll = async () => {
    await Promise.all([stats.refetch(), activity.refetch()]);
  };

  return {
    stats: stats.stats,
    activity: activity.activity,
    status,
    error: hasError,
    isLoading,
    refetch: refetchAll,
    refetchStats: stats.refetch,
    refetchActivity: activity.refetch,
  };
}
