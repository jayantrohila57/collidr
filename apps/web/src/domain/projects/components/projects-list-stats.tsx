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
    return <StatCardRowSkeleton count={4} />;
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
      label: "Archived / maintenance",
      value: data.archivedOrMaintenance,
      hint: "Hidden or maintenance",
      icon: "statusArchived",
    },
  ];

  return <StatCardRow items={items} />;
}
