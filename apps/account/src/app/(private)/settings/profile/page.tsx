import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SettingsSectionShell } from "@/app/(private)/settings/_components/settings-section-shell";
import { AccountSettingsClient } from "@/domain/settings/components/account-settings-client";
import { AccountSettingsSkeleton } from "@/domain/settings/components/account-settings-skeleton";
import { getServerSession } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your display name and avatar.",
};

export default async function ProfileSettingsPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/");

  return (
    <SettingsSectionShell
      title="Profile"
      description="Your name and avatar shown across Env Manager."
      showStats
    >
      <Suspense fallback={<AccountSettingsSkeleton />}>
        <AccountSettingsClient section="profile" />
      </Suspense>
    </SettingsSectionShell>
  );
}
