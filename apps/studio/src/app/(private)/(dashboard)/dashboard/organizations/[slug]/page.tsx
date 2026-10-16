import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import OrganizationDetailPage from "@/domain/organizations/components/organization-detail-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { OrganizationDetailPageSkeleton } from "@/domain/organizations/components/skeletons";
import { PermissionGate } from "@/domain/permissions/components/permission-gate";
import { guardOrganizationSlugPage } from "@/lib/page-guards";

interface OrganizationHubPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: OrganizationHubPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug,
    description: "Organization overview and administration.",
  };
}

export default async function OrganizationHubPage({
  params,
}: OrganizationHubPageProps) {
  const { slug } = await params;
  await guardOrganizationSlugPage(slug);

  if (!isOrganizationsEnabled()) {
    redirect("/dashboard");
  }

  return (
    <OrganizationsFeatureGate>
      <PermissionGate action="organization.hub.view">
        <Suspense fallback={<OrganizationDetailPageSkeleton />}>
          <OrganizationDetailPage slug={slug} />
        </Suspense>
      </PermissionGate>
    </OrganizationsFeatureGate>
  );
}
