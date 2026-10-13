"use client";

import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeaderActionButton } from "@/components/layout/app-layout";
import { ErrorState } from "@/components/patterns/error-state";
import DashboardSection from "@/components/section-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { isPersonalOrganization } from "@/lib/org-personal";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { OrganizationDetailStats } from "./organization-detail-stats";
import {
  OrganizationOverviewSections,
  OrganizationOverviewSectionsSkeleton,
} from "./organization-overview-sections";

export default function OrganizationDetailPage({ slug }: { slug: string }) {
  const { organization, listItem, status, error, reload } =
    useOrganizationBySlug(slug);

  if (status === "not-found") {
    notFound();
  }

  if (status === "error") {
    return (
      <ErrorState
        title="Organization unavailable"
        description={error?.message ?? "Could not load this workspace."}
        onRetry={() => void reload()}
      />
    );
  }

  const meta = listItem ?? organization;
  const personal = meta ? isPersonalOrganization(meta) : false;
  const settingsHref = `/dashboard/organizations/${slug}/settings` as Route;
  const displayName = listItem?.name ?? organization?.name ?? slug;

  return (
    <DashboardSection
      title={displayName}
      description={
        personal
          ? "Personal workspace overview and administration."
          : "Team workspace overview and administration."
      }
      back="/dashboard/organizations"
      metadata={
        status === "loading" ? (
          <Skeleton className="h-5 w-40" />
        ) : (
          <p className="font-mono text-muted-foreground text-xs">
            {organization?.slug ?? slug}
          </p>
        )
      }
      stats={<OrganizationDetailStats slug={slug} />}
      action={
        <PageHeaderActionButton
          label="Settings"
          icon="settings"
          render={<Link href={settingsHref} />}
        />
      }
    >
      {status === "loading" ? (
        <OrganizationOverviewSectionsSkeleton />
      ) : (
        <OrganizationOverviewSections slug={slug} />
      )}
    </DashboardSection>
  );
}
