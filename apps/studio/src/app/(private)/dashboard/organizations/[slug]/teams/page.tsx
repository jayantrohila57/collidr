import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrganizationTeamsPage } from "@/domain/organizations/components/organization-teams-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { getServerSession } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Teams",
  description: "Organization teams.",
};

export default async function OrganizationTeamsRoute({
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
      <OrganizationTeamsPage slug={slug} />
    </OrganizationsFeatureGate>
  );
}
