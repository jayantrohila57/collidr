import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SettingsSectionShell } from "@/app/(private)/settings/_components/settings-section-shell";
import { AccountSettingsSkeleton } from "@/domain/settings/components/account-settings-skeleton";
import { NotificationPreferencesPanel } from "@/domain/settings/components/notification-preferences-panel";
import { getServerSession } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Notifications",
  description: "In-app notification preferences.",
};

export default async function NotificationsSettingsPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/");

  return (
    <SettingsSectionShell
      title="Notifications"
      description="Where to review in-app alerts."
    >
      <Suspense fallback={<AccountSettingsSkeleton />}>
        <NotificationPreferencesPanel />
      </Suspense>
    </SettingsSectionShell>
  );
}
