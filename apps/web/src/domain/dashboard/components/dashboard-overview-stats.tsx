"use client";

import type { Route } from "next";
import {
  type StatCardItem,
  StatCardRow,
  StatCardRowSkeleton,
} from "@/components/patterns/stat-card";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { useDashboard } from "../hooks/use-dashboard";

export function DashboardOverviewStats() {
  const { stats, isLoading } = useDashboard();

  if (isLoading) {
    return <StatCardRowSkeleton count={4} />;
  }

  if (!stats) {
    return null;
  }

  const items: StatCardItem[] = [
    {
      label: "Projects",
      value: stats.totalProjects,
      hint: "In this workspace",
      icon: "project",
      href: "/dashboard/projects",
    },
    {
      label: "Environments",
      value: stats.totalEnvironments,
      hint: "Across projects",
      icon: "environment",
      href: "/dashboard/projects",
    },
    {
      label: "Variables",
      value: stats.totalVariables,
      hint: "Stored secrets & config",
      icon: "variable",
    },
    {
      label: "Members",
      value: stats.totalMembers ?? 1,
      hint: isOrganizationsEnabledOnClient()
        ? "Organization members"
        : "Personal workspace",
      icon: "member",
      href: isOrganizationsEnabledOnClient()
        ? ("/dashboard/settings/organization" as Route)
        : undefined,
    },
  ];

  return <StatCardRow items={items} />;
}
