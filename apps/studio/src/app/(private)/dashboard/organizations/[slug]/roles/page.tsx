import { isOrganizationsEnabled } from "@collidr/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrganizationRolesPage } from "@/domain/organizations/components/organization-roles-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { guardOrganizationSlugPage } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Roles & access",
  description: "Organization roles and permissions.",
};

export default async function OrganizationRolesRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!isOrganizationsEnabled()) redirect("/dashboard");
  const { slug } = await params;
  await guardOrganizationSlugPage(slug, "roles");
  return (
    <OrganizationsFeatureGate>
      <OrganizationRolesPage slug={slug} />
    </OrganizationsFeatureGate>
  );
}
