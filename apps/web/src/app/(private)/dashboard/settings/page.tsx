import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { SettingsPage } from "@/domain/settings/components/settings-page";
import { UserSettingsStats } from "@/domain/settings/components/user-settings-stats";
import { getServerSession } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account and application preferences.",
};

export default async function SettingsRoute() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <DashboardSection
      title="Settings"
      description="Account information and security preferences."
      stats={<UserSettingsStats />}
    >
      <SettingsPage />
    </DashboardSection>
  );
}
