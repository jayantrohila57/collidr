"use client";

import type { Route } from "next";
import Link from "next/link";
import {
  SettingsPanel,
  SettingsRow,
  SettingsSectionHeader,
} from "@/components/patterns/settings-layout";
import { Button } from "@/components/ui/button";
import { useSession } from "@/domain/auth/lib/auth-actions";

export function SecuritySettingsPanel() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) {
    return null;
  }

  return (
    <SettingsPanel>
      <SettingsSectionHeader
        title="Security"
        description="How you sign in and protect your account."
      />
      <SettingsRow
        label="Sign-in email"
        description="Used for authentication and account recovery."
      >
        <span className="text-sm">{user.email}</span>
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
