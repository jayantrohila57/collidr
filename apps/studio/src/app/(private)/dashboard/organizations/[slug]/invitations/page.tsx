import { isOrganizationsEnabled } from "@collidr/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrganizationInvitationsPage } from "@/domain/organizations/components/organization-invitations-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { guardOrganizationSlugPage } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Invitations",
  description: "Pending organization invitations.",
};

export default async function OrganizationInvitationsRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!isOrganizationsEnabled()) redirect("/dashboard");
  const { slug } = await params;
  await guardOrganizationSlugPage(slug, "invitations");
  return (
    <OrganizationsFeatureGate>
      <OrganizationInvitationsPage slug={slug} />
    </OrganizationsFeatureGate>
  );
}
