"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { trpc } from "@/utils/trpc";

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

export function useDashboard() {
  const { isSwitching } = useActiveOrganization();
  const [loadTimedOut, setLoadTimedOut] = useState(false);

  const overviewQuery = useQuery({
    ...trpc.dashboard.getOverview.queryOptions(),
    meta: { toastOnError: false },
    retry: 2,
  });

  const pending = isSwitching || overviewQuery.isPending;

  const stats = pending
    ? undefined
    : (overviewQuery.data?.stats as DashboardStats | undefined);
  const activity = pending
    ? undefined
    : (overviewQuery.data?.activity as RecentActivity | undefined);

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
      : overviewQuery.isError
        ? "error"
        : stats
          ? "success"
          : "empty";

  const refetchAll = async () => {
    await overviewQuery.refetch();
  };

  return {
    stats,
    activity,
    status,
    error: overviewQuery.error,
    isLoading: pending,
    refetch: refetchAll,
    refetchStats: refetchAll,
    refetchActivity: refetchAll,
  };
}
