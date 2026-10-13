import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrganizationMembersPage } from "@/domain/organizations/components/organization-members-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { getServerSession } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Members",
  description: "Organization members and roles.",
};

export default async function OrganizationMembersRoute({
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
      <OrganizationMembersPage slug={slug} />
    </OrganizationsFeatureGate>
  );
}
