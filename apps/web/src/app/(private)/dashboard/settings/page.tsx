import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { guardPageAction } from "@/lib/page-guards";
import { Suspense } from "react";
import DashboardSection from "@/components/section-dashboard";
import { AccountSettingsHeaderActions } from "@/domain/settings/components/account-settings-header-actions";
import { AccountSettingsSkeleton } from "@/domain/settings/components/account-settings-skeleton";
import { SettingsPage } from "@/domain/settings/components/settings-page";
import { UserSettingsStats } from "@/domain/settings/components/user-settings-stats";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account and application preferences.",
};

export default async function SettingsRoute() {
  await guardPageAction("profile.view");
  return (
    <DashboardSection
      title="Settings"
      description="Account information and security preferences."
      back={false}
      action={<AccountSettingsHeaderActions />}
      stats={<UserSettingsStats />}
    >
      <Suspense fallback={<AccountSettingsSkeleton />}>
        <SettingsPage />
      </Suspense>
    </DashboardSection>
  );
}
