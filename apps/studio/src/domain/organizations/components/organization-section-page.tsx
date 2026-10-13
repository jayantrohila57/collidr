"use client";

import type { Route } from "next";
import { notFound } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";

type OrganizationSectionPageProps = {
  slug: string;
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
};

export function OrganizationSectionPage({
  slug,
  title,
  description,
  children,
  action,
}: OrganizationSectionPageProps) {
  const { organization, status } = useOrganizationBySlug(slug);
  const hubHref = `/dashboard/organizations/${slug}` as Route;

  if (status === "not-found") {
    notFound();
  }

  return (
    <DashboardSection
      title={title}
      description={description}
      back={hubHref}
      titleAccessory={
        status === "loading" ? (
          <Skeleton className="h-5 w-32" />
        ) : (
          <span className="text-muted-foreground text-sm">
            {organization?.name}
          </span>
        )
      }
      action={action}
    >
      {children}
    </DashboardSection>
  );
}
