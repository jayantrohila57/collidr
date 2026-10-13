import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsSectionShell } from "@/app/(private)/settings/_components/settings-section-shell";
import { AccountSettingsClient } from "@/domain/settings/components/account-settings-client";
import { AccountSettingsSkeleton } from "@/domain/settings/components/account-settings-skeleton";
import { guardPageAction } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your display name and avatar.",
};

export default async function ProfileSettingsPage() {
  await guardPageAction("profile.view");

  return (
    <SettingsSectionShell
      title="Profile"
      description="Your name and avatar shown across Collidr."
      showStats
    >
      <Suspense fallback={<AccountSettingsSkeleton />}>
        <AccountSettingsClient section="profile" />
      </Suspense>
    </SettingsSectionShell>
  );
}
