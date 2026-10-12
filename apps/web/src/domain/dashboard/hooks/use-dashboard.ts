"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useOrgQueryScopeKey } from "@/components/org/active-organization-context";
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
  const queryClient = useQueryClient();
  const [loadTimedOut, setLoadTimedOut] = useState(false);

  useEffect(() => {
    void queryClient.invalidateQueries({
      queryKey: trpc.dashboard.getStats.queryKey(),
    });
  }, [orgScope, queryClient]);

  const statsQuery = useQuery({
    ...trpc.dashboard.getStats.queryOptions(),
    meta: { toastOnError: false },
    retry: 2,
  });

  useEffect(() => {
    if (!statsQuery.isLoading) {
      setLoadTimedOut(false);
      return;
    }
    const timer = window.setTimeout(
      () => setLoadTimedOut(true),
      DASHBOARD_LOAD_TIMEOUT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [statsQuery.isLoading]);

  const status: "loading" | "error" | "empty" | "success" = loadTimedOut
    ? "error"
    : statsQuery.isLoading
      ? "loading"
      : statsQuery.isError
        ? "error"
        : statsQuery.data
          ? "success"
          : "empty";

  return {
    stats: statsQuery.data as DashboardStats | undefined,
    status,
    error: statsQuery.error,
    isLoading: statsQuery.isLoading,
    refetch: statsQuery.refetch,
  };
}

export function useDashboardActivity() {
  const orgScope = useOrgQueryScopeKey();
  const queryClient = useQueryClient();

  useEffect(() => {
    void queryClient.invalidateQueries({
      queryKey: trpc.dashboard.getRecentActivity.queryKey(),
    });
  }, [orgScope, queryClient]);

  const activityQuery = useQuery({
    ...trpc.dashboard.getRecentActivity.queryOptions(),
    meta: { toastOnError: false },
  });

  const status: "loading" | "error" | "empty" | "success" =
    activityQuery.isLoading
      ? "loading"
      : activityQuery.isError
        ? "error"
        : activityQuery.data
          ? "success"
          : "empty";

  return {
    activity: activityQuery.data as RecentActivity | undefined,
    status,
    error: activityQuery.error,
    isLoading: activityQuery.isLoading,
    refetch: activityQuery.refetch,
  };
}

// Combined hook for convenience
export function useDashboard() {
  const stats = useDashboardStats();
  const activity = useDashboardActivity();

  // Overall loading state
  const isLoading = stats.isLoading || activity.isLoading;

  // Overall error state
  const hasError = stats.error || activity.error;

  // Overall status
  const status: "loading" | "error" | "empty" | "success" = isLoading
    ? "loading"
    : hasError
      ? "error"
      : !stats.stats && !activity.activity
        ? "empty"
        : "success";

  // Refetch both queries
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
