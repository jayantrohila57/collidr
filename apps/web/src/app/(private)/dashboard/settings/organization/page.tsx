import { auth } from "@env-manager/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import OrganizationSettingsGate from "./organization-settings-gate";

export default async function OrganizationSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  return <OrganizationSettingsGate />;
}
