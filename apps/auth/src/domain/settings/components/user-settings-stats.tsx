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
import { useSession } from "@/domain/auth/lib/auth-actions";
import { trpc } from "@/utils/trpc";

export function UserSettingsStats() {
  const { data: session, isPending: sessionPending } = useSession();
  const { data, isPending, isError } = useQuery({
    ...trpc.dashboard.getUserAccountStats.queryOptions(),
    enabled: Boolean(session?.user?.id),
  });

  if (sessionPending || (isPending && Boolean(session?.user))) {
    return <StatCardRowSkeleton count={4} />;
  }

  if (isError) {
    return (
      <StatCardRowSkeleton count={4} className="opacity-60" aria-label="Could not load stats" />
    );
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
