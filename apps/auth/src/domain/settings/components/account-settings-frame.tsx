"use client";

import {
  type SettingsTab,
  SettingsFrame,
  SettingsRailCard,
} from "@loftlancer/ui/patterns/settings-frame";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Bell,
  Monitor,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { GithubIcon } from "@loftlancer/ui/github-icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import { formatDate } from "@/lib/format";
import { formatRelativeShort } from "@/lib/format-relative-short";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { trpc } from "@/utils/trpc";
import { AccountSettingsHeaderActions } from "./account-settings-header-actions";

const TABS: (SettingsTab & { audit?: boolean })[] = [
  { href: "/settings/profile", label: "Profile", icon: <User /> },
  { href: "/settings/security", label: "Security", icon: <ShieldCheck /> },
  { href: "/settings/sessions", label: "Sessions", icon: <Monitor /> },
  { href: "/settings/accounts", label: "Connected accounts", icon: <GithubIcon /> },
  { href: "/settings/notifications", label: "Notifications", icon: <Bell /> },
  { href: "/settings/timeline", label: "Activity", icon: <Activity />, audit: true },
  { href: "/settings/danger", label: "Danger zone", icon: <ShieldAlert /> },
];

function HealthCard() {
  const { data } = useQuery(trpc.dashboard.getUserAccountStats.queryOptions());
  if (!data) return null;
  const rows: [string, ReactNode][] = [
    ...(isOrganizationsEnabledOnClient()
      ? ([["Organizations", data.organizationCount]] as [string, ReactNode][])
      : []),
    ["Projects owned", data.ownedProjectCount],
    [
      "Account age",
      data.accountCreatedAt ? formatRelativeShort(data.accountCreatedAt) : "—",
    ],
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

export function AccountSettingsFrame({
  children,
  top,
}: {
  children: ReactNode;
  top?: ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const audit = isActionsAuditEnabledOnClient();
  const tabs = TABS.filter((t) => !t.audit || audit).map(({ audit: _a, ...t }) => ({
    ...t,
    active: pathname === t.href || pathname.startsWith(`${t.href}/`),
  }));

  return (
    <SettingsFrame
      LinkComponent={Link as never}
      avatar={{ src: user?.image, name: user?.name }}
      title={user?.name ?? "Account"}
      subtitle={user?.email}
      actions={<AccountSettingsHeaderActions />}
      tabs={tabs}
      top={top}
      aside={
        user ? (
          <>
            <SettingsRailCard
              title="Audit rail"
              items={[
                { label: "User ID", value: user.id, copy: true },
                ...(user.createdAt
                  ? [{ label: "Joined", value: formatDate(String(user.createdAt)) }]
                  : []),
                ...(user.updatedAt
                  ? [{ label: "Last updated", value: formatDate(String(user.updatedAt)) }]
                  : []),
              ]}
            />
            <HealthCard />
          </>
        ) : null
      }
    >
      {children}
    </SettingsFrame>
  );
}
