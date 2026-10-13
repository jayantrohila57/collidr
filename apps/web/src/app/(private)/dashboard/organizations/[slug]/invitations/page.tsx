import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrganizationInvitationsPage } from "@/domain/organizations/components/organization-invitations-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { getServerSession } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Invitations",
  description: "Pending organization invitations.",
};

export default async function OrganizationInvitationsRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user) redirect("/");
  if (!isOrganizationsEnabled()) redirect("/dashboard");
  const { slug } = await params;
  return (
    <OrganizationsFeatureGate>
      <OrganizationInvitationsPage slug={slug} />
    </OrganizationsFeatureGate>
  );
}
