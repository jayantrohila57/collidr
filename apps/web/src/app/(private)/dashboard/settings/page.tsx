import { auth } from "@env-manager/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import Shell from "@/components/shell";
import { SettingsPage } from "@/domain/settings/components/settings-page";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account and application preferences.",
};

export default async function SettingsRoute() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  return (
    <Shell>
      <Shell.Section variant="dashboard" padding="dashboard" scale="full">
        <DashboardSection
          title="Settings"
          description="Account information and security preferences."
        >
          <SettingsPage />
        </DashboardSection>
      </Shell.Section>
    </Shell>
  );
}
