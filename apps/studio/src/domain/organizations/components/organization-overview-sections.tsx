"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import {
  type OrgHubSection,
  orgHubSectionActions,
} from "@/domain/permissions/org-section-actions";
import { useOrgQueryEnabled } from "@/hooks/use-org-query-enabled";
import { trpc } from "@/utils/trpc";
import { ORGANIZATION_SECTIONS } from "../config/org-sections";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { OrganizationSectionCard } from "./organization-section-card";

function formatCountLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function OrganizationOverviewSectionsSkeleton() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-busy="true"
    >
      {(
        [
          "section-a",
          "section-b",
          "section-c",
          "section-d",
          "section-e",
          "section-f",
          "section-g",
        ] as const
      ).map((id) => (
        <Skeleton key={id} className="h-[7.5rem] rounded-2xl" />
      ))}
    </div>
  );
}

function SectionCardGated({
  sectionId,
  slug,
  summary,
}: {
  sectionId: OrgHubSection;
  slug: string;
  summary: string;
}) {
  const action = orgHubSectionActions[sectionId];
  const { allowed, isLoading } = useCan(action);
  const section = ORGANIZATION_SECTIONS.find((s) => s.id === sectionId);
  if (isLoading || !allowed || !section) return null;

  return (
    <OrganizationSectionCard
      href={section.href(slug)}
      icon={section.icon}
      title={section.title}
      description={section.description}
      summary={summary}
    />
  );
}

export function OrganizationOverviewSections({ slug }: { slug: string }) {
  const { organization, status } = useOrganizationBySlug(slug);
  const queryEnabled = useOrgQueryEnabled();
  const stats = useQuery({
    ...trpc.dashboard.getOrgSettingsStats.queryOptions(),
    enabled: queryEnabled && status === "success" && Boolean(organization?.id),
  });

  // Same condition as OrganizationDetailStats so stats and cards resolve together.
  if (status === "loading" || !queryEnabled || stats.isPending) {
    return <OrganizationOverviewSectionsSkeleton />;
  }

  // One source of truth with the stats rail: server SQL counts (#251).
  // getFullOrganization caps members at 100, so its array length is wrong.
  const memberCount = stats.data?.memberCount;
  const invitationCount = stats.data?.pendingInvites;
  const projectCount = stats.data?.projectCount;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ORGANIZATION_SECTIONS.map((section) => {
        let summary =
          section.id === "teams" || section.id === "timeline" ? "Open" : "View";
        if (section.id === "projects" && projectCount !== undefined) {
          summary = formatCountLabel(projectCount, "project", "projects");
        }
        if (section.id === "members" && memberCount !== undefined) {
          summary = formatCountLabel(memberCount, "member", "members");
          if (invitationCount !== undefined && invitationCount > 0) {
            summary += ` · ${formatCountLabel(
              invitationCount,
              "pending invite",
              "pending invites",
            )}`;
          }
        }
        if (section.id === "invitations" && invitationCount !== undefined) {
          summary = formatCountLabel(
            invitationCount,
            "pending invite",
            "pending invites",
          );
        }
        if (section.id === "settings") {
          summary = organization?.slug ?? "—";
        }

        return (
          <SectionCardGated
            key={section.id}
            sectionId={section.id}
            slug={slug}
            summary={summary}
          />
        );
      })}
    </div>
  );
}
