import { auth } from "@env-manager/auth";
import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import OrganizationSettingsClient from "./organization-settings-client";

export default async function OrganizationSettingsPage() {
  if (!isOrganizationsEnabled()) {
    redirect("/dashboard/settings");
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  return <OrganizationSettingsClient />;
}
