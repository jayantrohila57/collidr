import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SettingsSectionShell } from "@/app/(private)/settings/_components/settings-section-shell";
import { AccountSettingsClient } from "@/domain/settings/components/account-settings-client";
import { AccountSettingsSkeleton } from "@/domain/settings/components/account-settings-skeleton";
import { getServerSession } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Sessions",
  description: "Active sign-in sessions.",
};

export default async function SessionsSettingsPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/");

  return (
    <SettingsSectionShell
      title="Sessions"
      description="Devices and browsers signed in to your account."
    >
      <Suspense fallback={<AccountSettingsSkeleton />}>
        <AccountSettingsClient section="sessions" />
      </Suspense>
    </SettingsSectionShell>
  );
}
