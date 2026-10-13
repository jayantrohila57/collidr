"use client";

import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppIcon } from "@/components/patterns/app-icon";
import { ErrorState } from "@/components/patterns/error-state";
import DashboardSection from "@/components/section-dashboard";
import { Button } from "@/components/ui/button";
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

  return (
    <DashboardSection
      title={organization?.name ?? slug}
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
        <Button
          type="button"
          size="sm"
          className="gap-2 max-sm:size-8 max-sm:gap-0 max-sm:px-0"
          render={<Link href={settingsHref} />}
        >
          <AppIcon name="settings" className="text-current" />
          <span className="sr-only sm:not-sr-only">Settings</span>
        </Button>
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
