import type { ReactNode } from "react";
import DashboardSection from "@/components/section-dashboard";
import { AccountSettingsHeaderActions } from "@/domain/settings/components/account-settings-header-actions";
import { UserSettingsStats } from "@/domain/settings/components/user-settings-stats";

export function SettingsSectionShell({
  title,
  description,
  children,
  showStats = false,
}: {
  title: string;
  description: string;
  children: ReactNode;
  showStats?: boolean;
}) {
  return (
    <DashboardSection
      title={title}
      description={description}
      back={false}
      action={<AccountSettingsHeaderActions />}
      stats={showStats ? <UserSettingsStats /> : undefined}
    >
      {children}
    </DashboardSection>
  );
}
