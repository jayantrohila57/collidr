"use client";

import { useMemo } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import {
  type StatCardItem,
  StatCardRow,
  StatCardRowSkeleton,
} from "@/components/patterns/stat-card";
import { isPersonalOrganization } from "@/lib/org-personal";

export function OrganizationsListStats() {
  const { orgs, loading, initialLoadDone, activeOrganizationId } =
    useActiveOrganization();

  const stats = useMemo(() => {
    const personal = orgs.filter((o) => isPersonalOrganization(o)).length;
    const team = orgs.length - personal;
    return { total: orgs.length, personal, team };
  }, [orgs]);

  if (!initialLoadDone || loading) {
    return <StatCardRowSkeleton count={4} compact />;
  }

  const activeName =
    orgs.find((o) => o.id === activeOrganizationId)?.name ?? "—";

  const items: StatCardItem[] = [
    {
      label: "Workspaces",
      value: stats.total,
      hint: "You belong to",
      icon: "organization",
    },
    {
      label: "Team",
      value: stats.team,
      hint: "Shared organizations",
      icon: "member",
    },
    {
      label: "Personal",
      value: stats.personal,
      hint: "Private workspaces",
      icon: "user",
    },
    {
      label: "Active",
      value: activeName,
      hint: "Current sidebar org",
      icon: "statusActive",
    },
  ];

  return <StatCardRow items={items} compact />;
}
