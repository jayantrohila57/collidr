import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import OrganizationDetailPage from "@/domain/organizations/components/organization-detail-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { OrganizationDetailSkeleton } from "@/domain/organizations/components/skeletons";
import { PermissionGate } from "@/domain/permissions/components/permission-gate";
import { isActionsAuditEnabledOnServer } from "@/lib/actions-audit-enabled";
import { getServerSession } from "@/lib/server-auth";

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
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/");
  }
  if (!isOrganizationsEnabled()) {
    redirect("/dashboard");
  }
  if (!isActionsAuditEnabledOnServer()) {
    redirect("/dashboard/settings/organization");
  }

  const { slug } = await params;

  return (
    <OrganizationsFeatureGate>
      <PermissionGate action="organization.hub.view">
        <Suspense fallback={<OrganizationDetailSkeleton />}>
          <OrganizationDetailPage slug={slug} />
        </Suspense>
      </PermissionGate>
    </OrganizationsFeatureGate>
  );
}
