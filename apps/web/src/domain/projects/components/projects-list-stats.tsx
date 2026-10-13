"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type StatCardItem,
  StatCardRow,
  StatCardRowSkeleton,
} from "@/components/patterns/stat-card";
import { useOrgQueryEnabled } from "@/hooks/use-org-query-enabled";
import { trpc } from "@/utils/trpc";

export function ProjectsListStats() {
  const queryEnabled = useOrgQueryEnabled();
  const { data, isPending } = useQuery({
    ...trpc.dashboard.getProjectsListStats.queryOptions(),
    enabled: queryEnabled,
  });

  if (isPending || !queryEnabled) {
    return <StatCardRowSkeleton count={8} />;
  }

  if (!data) {
    return null;
  }

  const items: StatCardItem[] = [
    {
      label: "Total",
      value: data.total,
      hint: "All projects",
      icon: "project",
    },
    {
      label: "Active",
      value: data.active,
      hint: "Status active",
      icon: "statusActive",
    },
    {
      label: "Private",
      value: data.private,
      hint: "Not public",
      icon: "lock",
    },
    {
      label: "Public",
      value: data.public,
      hint: "Visible metadata",
      icon: "globe",
    },
    {
      label: "Archived / maintenance",
      value: data.archivedOrMaintenance,
      hint: "Hidden or maintenance",
      icon: "statusArchived",
    },
    {
      label: "Environments",
      value: data.totalEnvironments,
      hint: "Across projects",
      icon: "environment",
    },
    {
      label: "Variables",
      value: data.totalVariables,
      hint: "Across environments",
      icon: "variable",
    },
    {
      label: "Updated (7d)",
      value: data.recentlyUpdated7d,
      hint: "Recently touched",
      icon: "calendar",
    },
  ];

  return <StatCardRow items={items} compact />;
}
