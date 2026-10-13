"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type StatCardItem,
  StatCardRow,
  StatCardRowSkeleton,
} from "@/components/patterns/stat-card";
import { useOrgQueryEnabled } from "@/hooks/use-org-query-enabled";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { trpc } from "@/utils/trpc";

export function OrgSettingsStats() {
  const orgsEnabled = isOrganizationsEnabledOnClient();
  const queryEnabled = useOrgQueryEnabled();

  const { data, isPending } = useQuery({
    ...trpc.dashboard.getOrgSettingsStats.queryOptions(),
    enabled: orgsEnabled && queryEnabled,
  });

  if (!orgsEnabled) {
    return null;
  }

  if (isPending || !queryEnabled) {
    return <StatCardRowSkeleton count={4} />;
  }

  if (!data) {
    return null;
  }

  const items: StatCardItem[] = [
    {
      label: "Members",
      value: data.memberCount,
      hint: "In this organization",
      icon: "member",
    },
    {
      label: "Pending invites",
      value: data.pendingInvites,
      hint: "Awaiting acceptance",
      icon: "invite",
    },
    {
      label: "Projects",
      value: data.projectCount,
      hint: "In this workspace",
      icon: "project",
    },
    {
      label: "Your role",
      value: data.role.charAt(0).toUpperCase() + data.role.slice(1),
      hint: "Organization permissions",
      icon: "user",
    },
  ];

  return <StatCardRow items={items} />;
}
