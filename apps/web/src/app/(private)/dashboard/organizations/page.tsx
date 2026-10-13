import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { OrganizationsPageClient } from "@/domain/organizations/components/organizations-page-client";
import { OrganizationsListSkeleton } from "@/domain/organizations/components/skeletons";
import { isActionsAuditEnabledOnServer } from "@/lib/actions-audit-enabled";
import { getServerSession } from "@/lib/server-auth";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Organizations",
  description: `Manage workspaces and members in ${siteConfig.name}.`,
};

export default async function OrganizationsPage() {
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

  return (
    <OrganizationsFeatureGate>
      <Suspense fallback={<OrganizationsListSkeleton />}>
        <OrganizationsPageClient />
      </Suspense>
    </OrganizationsFeatureGate>
  );
}
