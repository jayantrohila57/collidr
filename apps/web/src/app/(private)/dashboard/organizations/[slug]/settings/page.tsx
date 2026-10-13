import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrganizationSettingsPage } from "@/domain/organizations/components/organization-settings-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { getServerSession } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Organization settings",
  description: "Workspace profile and danger zone.",
};

export default async function OrganizationSettingsRoute({
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
      <OrganizationSettingsPage slug={slug} />
    </OrganizationsFeatureGate>
  );
}
