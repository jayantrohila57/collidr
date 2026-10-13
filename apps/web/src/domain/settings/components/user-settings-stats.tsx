"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type StatCardItem,
  StatCardRow,
  StatCardRowSkeleton,
} from "@/components/patterns/stat-card";
import { formatDate } from "@/lib/format";
import { formatRelativeShort } from "@/lib/format-relative-short";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { trpc } from "@/utils/trpc";

export function UserSettingsStats() {
  const { data, isPending } = useQuery(
    trpc.dashboard.getUserAccountStats.queryOptions(),
  );

  if (isPending) {
    return <StatCardRowSkeleton count={4} />;
  }

  if (!data) {
    return null;
  }

  const orgsEnabled = isOrganizationsEnabledOnClient();
  const accountAge = data.accountCreatedAt
    ? formatRelativeShort(data.accountCreatedAt)
    : "—";

  const items: StatCardItem[] = [
    {
      label: "Organizations",
      value: orgsEnabled ? data.organizationCount : "—",
      hint: orgsEnabled ? "Workspaces you belong to" : "Organizations disabled",
      icon: "organization",
    },
    {
      label: "Projects owned",
      value: data.ownedProjectCount,
      hint: "Created by you",
      icon: "project",
    },
    {
      label: "Account age",
      value: accountAge,
      hint: data.accountCreatedAt
        ? `Joined ${formatDate(data.accountCreatedAt)}`
        : "Member since sign-up",
      icon: "user",
    },
    {
      label: "Sign-in",
      value: "GitHub",
      hint: "Connected provider",
      icon: "github",
    },
  ];

  return <StatCardRow items={items} />;
}
