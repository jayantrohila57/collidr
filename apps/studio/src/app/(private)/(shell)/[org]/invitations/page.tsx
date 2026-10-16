import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrganizationInvitationsPage } from "@/domain/organizations/components/organization-invitations-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { guardOrganizationSlugPage } from "@/lib/page-guards";
import { routes } from "@/utils/navigation";

export const metadata: Metadata = {
  title: "Invitations",
  description: "Pending organization invitations.",
};

export default async function OrganizationInvitationsRoute({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  if (!isOrganizationsEnabled()) redirect(routes.home());
  const { org: slug } = await params;
  await guardOrganizationSlugPage(slug, "invitations");
  return (
    <OrganizationsFeatureGate>
      <OrganizationInvitationsPage slug={slug} />
    </OrganizationsFeatureGate>
  );
}
