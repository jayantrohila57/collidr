import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { guardOrganizationSlugPage } from "@/lib/page-guards";
import { OrganizationSettingsPage } from "@/domain/organizations/components/organization-settings-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";

export const metadata: Metadata = {
  title: "Organization settings",
  description: "Workspace profile and danger zone.",
};

export default async function OrganizationSettingsRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!isOrganizationsEnabled()) redirect("/dashboard");
    const { slug } = await params;
  await guardOrganizationSlugPage(slug, "settings");
  return (
    <OrganizationsFeatureGate>
      <OrganizationSettingsPage slug={slug} />
    </OrganizationsFeatureGate>
  );
}
