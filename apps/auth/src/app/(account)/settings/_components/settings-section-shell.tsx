import { SettingsSection } from "@loftlancer/ui/patterns/settings-frame";
import type { ReactNode } from "react";
import { AccountSettingsFrame } from "@/domain/settings/components/account-settings-frame";
import { ActivityOverview } from "@/domain/settings/components/activity-overview";

export function SettingsSectionShell({
  title,
  description,
  children,
  activity = false,
}: {
  title: string;
  description: string;
  children: ReactNode;
  /** @deprecated stats moved to the Health rail card. */
  showStats?: boolean;
  /** Show the activity heatmap above the section (Activity tab). */
  activity?: boolean;
}) {
  return (
    <AccountSettingsFrame
      top={activity ? <ActivityOverview scope="self" title="User activity" /> : undefined}
    >
      <SettingsSection title={title} description={description} bare>
        {children}
      </SettingsSection>
    </AccountSettingsFrame>
  );
}
