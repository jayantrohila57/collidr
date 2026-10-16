"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type StatCardItem,
  StatCardRow,
  StatCardRowSkeleton,
} from "@/components/patterns/stat-card";
import { RoleBadge } from "@/components/patterns/status-badge";
import { useOrgQueryEnabled } from "@/hooks/use-org-query-enabled";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";

export function OrganizationDetailStats({ slug }: { slug: string }) {
  const { organization, status } = useOrganizationBySlug(slug);
  const queryEnabled = useOrgQueryEnabled();
  const { data, isPending } = useQuery({
    ...trpc.dashboard.getOrgSettingsStats.queryOptions(),
    enabled: queryEnabled && status === "success" && Boolean(organization?.id),
  });

  if (status === "loading" || isPending || !queryEnabled) {
    return <StatCardRowSkeleton count={4} compact />;
  }

  const items: StatCardItem[] = [
    {
      label: "Members",
      value: data?.memberCount ?? organization?.memberCount ?? "—",
      hint: "In this workspace",
      icon: "member",
      href: routes.orgSection(slug, "members"),
    },
    {
      label: "Pending invites",
      value: data?.pendingInvites ?? organization?.invitationCount ?? "—",
      hint: "Awaiting acceptance",
      icon: "invite",
      href: routes.orgSection(slug, "invitations"),
    },
    {
      label: "Projects",
      value: data?.projectCount ?? "—",
      hint: "Linked to this org",
      icon: "project",
      href: routes.projects(slug),
    },
    {
      label: "Your role",
      value: data?.role ? <RoleBadge role={data.role} /> : "—",
      hint: "Organization access",
      icon: "user",
      href: routes.orgSection(slug, "roles"),
    },
  ];

  return <StatCardRow items={items} compact />;
}
