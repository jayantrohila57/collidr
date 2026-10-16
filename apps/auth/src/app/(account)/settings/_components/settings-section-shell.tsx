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
      title={title}
      description={description}
      top={
        activity ? (
          <ActivityOverview scope="self" title="User activity" />
        ) : undefined
      }
    >
      {children}
    </AccountSettingsFrame>
  );
}
