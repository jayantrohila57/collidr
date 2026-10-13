"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type StatCardItem,
  StatCardRow,
  StatCardRowSkeleton,
} from "@/components/patterns/stat-card";
import { useOrgQueryEnabled } from "@/hooks/use-org-query-enabled";
import { trpc } from "@/utils/trpc";

export function ActivitySummaryStats() {
  const queryEnabled = useOrgQueryEnabled();
  const { data, isPending } = useQuery({
    ...trpc.dashboard.getActivitySummary.queryOptions(),
    enabled: queryEnabled,
  });

  if (isPending || !queryEnabled) {
    return <StatCardRowSkeleton count={4} />;
  }

  if (!data) {
    return null;
  }

  const items: StatCardItem[] = [
    {
      label: "Last 7 days",
      value: data.eventsLast7Days,
      hint: "Recent audit events",
      icon: "activity",
    },
    {
      label: "Last 30 days",
      value: data.eventsLast30Days,
      hint: "Rolling month",
      icon: "calendar",
    },
    {
      label: "All time",
      value: data.eventsAllTime,
      hint: "Total logged events",
      icon: "activity",
    },
    {
      label: "Active projects",
      value: data.projectsWithEventsLast7Days,
      hint: "With events this week",
      icon: "project",
    },
  ];

  return <StatCardRow items={items} />;
}
