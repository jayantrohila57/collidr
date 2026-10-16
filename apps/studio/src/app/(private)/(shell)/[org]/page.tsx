import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import OrganizationDetailPage from "@/domain/organizations/components/organization-detail-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { OrganizationDetailPageSkeleton } from "@/domain/organizations/components/skeletons";
import { PermissionGate } from "@/domain/permissions/components/permission-gate";
import { guardOrganizationSlugPage } from "@/lib/page-guards";
import { routes } from "@/utils/navigation";

interface OrganizationHubPageProps {
  params: Promise<{ org: string }>;
}

export async function generateMetadata({
  params,
}: OrganizationHubPageProps): Promise<Metadata> {
  const { org: slug } = await params;
  return {
    title: slug,
    description: "Organization overview and administration.",
  };
}

export default async function OrganizationHubPage({
  params,
}: OrganizationHubPageProps) {
  const { org: slug } = await params;
  await guardOrganizationSlugPage(slug);

  if (!isOrganizationsEnabled()) {
    redirect(routes.home());
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
