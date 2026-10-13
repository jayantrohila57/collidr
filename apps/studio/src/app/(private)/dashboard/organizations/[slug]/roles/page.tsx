import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrganizationRolesPage } from "@/domain/organizations/components/organization-roles-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { getServerSession } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Roles & access",
  description: "Organization roles and permissions.",
};

export default async function OrganizationRolesRoute({
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
      <OrganizationRolesPage slug={slug} />
    </OrganizationsFeatureGate>
  );
}
