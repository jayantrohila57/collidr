"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type StatCardItem,
  StatCardRow,
  StatCardRowSkeleton,
} from "@/components/patterns/stat-card";
import { useOrgQueryEnabled } from "@/hooks/use-org-query-enabled";
import { trpc } from "@/utils/trpc";
import { useProjects } from "../hooks/use-projects";
import {
  countProjectsByStatus,
  countProjectsByVisibility,
} from "../lib/filter-projects";

type ProjectsListStatsProps = {
  list?: ReturnType<typeof useProjects>;
};

export function ProjectsListStats({ list }: ProjectsListStatsProps = {}) {
  const queryEnabled = useOrgQueryEnabled();
  const internal = useProjects();
  const { status, projects } = list ?? internal;

  const statsQuery = useQuery({
    ...trpc.dashboard.getProjectsListStats.queryOptions(),
    enabled: queryEnabled && status === "success",
    meta: { toastOnError: false },
  });

  if (!queryEnabled || status === "loading") {
    return <StatCardRowSkeleton count={8} compact />;
  }

  if (status === "error") {
    return null;
  }

  const data = statsQuery.data;

  if (statsQuery.isPending && !data) {
    return <StatCardRowSkeleton count={8} compact />;
  }

  if (!data) {
    return null;
  }

  const statusCounts = countProjectsByStatus(projects);
  const visibilityCounts = countProjectsByVisibility(projects);

  const items: StatCardItem[] = [
    {
      label: "Total",
      value: data.total,
      hint: "All projects",
      icon: "project",
    },
    {
      label: "Active",
      value: statusCounts.active,
      hint: "Status active",
      icon: "statusActive",
    },
    {
      label: "Private",
      value: visibilityCounts.private,
      hint: "Not public",
      icon: "lock",
    },
    {
      label: "Public",
      value: visibilityCounts.public,
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
