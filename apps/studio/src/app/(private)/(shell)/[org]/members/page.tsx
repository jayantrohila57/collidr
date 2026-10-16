import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrganizationMembersPage } from "@/domain/organizations/components/organization-members-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { guardOrganizationSlugPage } from "@/lib/page-guards";
import { routes } from "@/utils/navigation";

export const metadata: Metadata = {
  title: "Members",
  description: "Organization members and roles.",
};

export default async function OrganizationMembersRoute({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  if (!isOrganizationsEnabled()) redirect(routes.home());
  const { org: slug } = await params;
  await guardOrganizationSlugPage(slug, "members");
  return (
    <OrganizationsFeatureGate>
      <OrganizationMembersPage slug={slug} />
    </OrganizationsFeatureGate>
  );
}
