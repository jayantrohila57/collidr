import { isOrganizationsEnabled } from "@collidr/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrganizationTeamsPage } from "@/domain/organizations/components/organization-teams-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { guardOrganizationSlugPage } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Teams",
  description: "Organization teams.",
};

export default async function OrganizationTeamsRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!isOrganizationsEnabled()) redirect("/dashboard");
  const { slug } = await params;
  await guardOrganizationSlugPage(slug, "teams");
  return (
    <OrganizationsFeatureGate>
      <OrganizationTeamsPage slug={slug} />
    </OrganizationsFeatureGate>
  );
}
