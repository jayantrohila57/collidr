import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SettingsSectionShell } from "@/app/(private)/settings/_components/settings-section-shell";
import { AccountSettingsSkeleton } from "@/domain/settings/components/account-settings-skeleton";
import { SecuritySettingsPanel } from "@/domain/settings/components/security-settings-panel";
import { getServerSession } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Security",
  description: "Sign-in and account protection.",
};

export default async function SecuritySettingsPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/");

  return (
    <SettingsSectionShell
      title="Security"
      description="How you sign in and protect your account."
    >
      <Suspense fallback={<AccountSettingsSkeleton />}>
        <SecuritySettingsPanel />
      </Suspense>
    </SettingsSectionShell>
  );
}
