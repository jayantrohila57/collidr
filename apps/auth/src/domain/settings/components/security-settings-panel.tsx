"use client";

import { Button } from "@loftlancer/ui/button";
import type { Route } from "next";
import Link from "next/link";
import {
  SettingsPanel,
  SettingsRow,
} from "@/components/patterns/settings-layout";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { sessionDeviceLabel } from "@/lib/session-device";

export function SecuritySettingsPanel() {
  const { data: session } = useSession();
  const user = session?.user;
  const current = session?.session;

  if (!user) {
    return null;
  }

  return (
    <SettingsPanel>
      <SettingsRow
        label="Sign-in email"
        description="Used for authentication and account recovery."
      >
        <span className="text-sm">{user.email}</span>
      </SettingsRow>
      <SettingsRow
        label="This device"
        description="The browser you are using right now."
      >
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm">
            {sessionDeviceLabel(current?.userAgent)}
          </span>
          <span className="text-muted-foreground text-xs tabular-nums">
            {current?.ipAddress ?? "IP unknown"}
          </span>
        </span>
      </SettingsRow>
      <SettingsRow
        label="Active sessions"
        description="Review devices that are signed in."
      >
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-fit"
          render={<Link href={"/settings/sessions" as Route} />}
        >
          Manage sessions
        </Button>
      </SettingsRow>
      <SettingsRow
        label="Connected accounts"
        description="OAuth providers linked to this profile."
      >
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-fit"
          render={<Link href={"/settings/accounts" as Route} />}
        >
          Manage connections
        </Button>
      </SettingsRow>
    </SettingsPanel>
  );
}
