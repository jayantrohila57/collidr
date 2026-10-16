"use client";

import {
  SettingsFrame,
  SettingsRailCard,
} from "@loftlancer/ui/patterns/settings-frame";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { notFound, usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import {
  Activity,
  KeyRound,
  LayoutGrid,
  Mail,
  Settings,
  Users,
  UsersRound,
} from "@/lib/icons";
import { trpc } from "@/utils/trpc";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { ActivityOverview } from "./activity-overview";

type OrganizationSectionPageProps = {
  slug: string;
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  /** Show the org activity heatmap above the section (Activity tab). */
  activity?: boolean;
};

function OrgHealthCard() {
  const { data, isError } = useQuery(
    trpc.dashboard.getOrgSettingsStats.queryOptions(undefined, {
      retry: false,
    }),
  );
  if (!data || isError) return null;
  const rows: [string, ReactNode][] = [
    [
      "Your role",
      <span key="role" className="capitalize">
        {data.role}
      </span>,
    ],
    ["Members", data.memberCount],
    ["Pending invites", data.pendingInvites],
    ["Projects", data.projectCount],
  ];
  return (
    <SettingsRailCard title="Health">
      <dl className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </SettingsRailCard>
  );
}

function formatDay(value: Date | string) {
  return new Date(value).toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function OrganizationSectionPage({
  slug,
  title,
  description,
  children,
  action,
  activity = false,
}: OrganizationSectionPageProps) {
  const { organization, status } = useOrganizationBySlug(slug);
  const pathname = usePathname();

  if (status === "not-found") {
    notFound();
  }

  const base = `/dashboard/organizations/${slug}`;
  const tabs = [
    { href: base, label: "Overview", icon: <LayoutGrid /> },
    { href: `${base}/settings`, label: "General", icon: <Settings /> },
    { href: `${base}/members`, label: "Members", icon: <Users /> },
    { href: `${base}/invitations`, label: "Invitations", icon: <Mail /> },
    { href: `${base}/teams`, label: "Teams", icon: <UsersRound /> },
    { href: `${base}/roles`, label: "Roles", icon: <KeyRound /> },
    ...(isActionsAuditEnabledOnClient()
      ? [{ href: `${base}/timeline`, label: "Activity", icon: <Activity /> }]
      : []),
  ].map((t) => ({ ...t, active: pathname === t.href }));

  return (
    <SettingsFrame
      LinkComponent={Link as never}
      back={{ href: base, label: "Organization overview" }}
      avatar={{ src: organization?.logo, name: organization?.name ?? null }}
      title={title}
      description={description}
      identity={
        organization ? (
          organization.name
        ) : (
          <Skeleton className="inline-block h-3 w-28 align-middle" />
        )
      }
      subtitle={organization ? `/${organization.slug}` : undefined}
      actions={action}
      tabs={tabs}
      top={
        activity ? (
          <ActivityOverview scope="org" title="Organization activity" />
        ) : undefined
      }
      aside={
        organization ? (
          <>
            <SettingsRailCard
              title="Audit rail"
              items={[
                {
                  label: "Organization ID",
                  value: organization.id,
                  copy: true,
                },
                { label: "Slug", value: organization.slug, copy: true },
                ...(organization.createdAt
                  ? [
                      {
                        label: "Created",
                        value: formatDay(organization.createdAt),
                      },
                    ]
                  : []),
              ]}
            />
            <OrgHealthCard />
          </>
        ) : null
      }
    >
      {children}
    </SettingsFrame>
  );
}
