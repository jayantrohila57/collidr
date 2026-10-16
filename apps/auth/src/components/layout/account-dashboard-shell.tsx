"use client";

import { AppShell } from "@loftlancer/ui/patterns/app-shell";
import { AccountSettingsSidebar } from "@/components/account-settings-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { SettingsBreadcrumbs } from "@/components/settings-breadcrumbs";
import { UserMenu } from "@/domain/auth/components/user-menu";

export function AccountDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      sidebar={<AccountSettingsSidebar />}
      breadcrumbs={<SettingsBreadcrumbs className="flex-nowrap lg:flex-wrap" />}
      headerActions={
        <>
          <ModeToggle compact />
          <UserMenu />
        </>
      }
    >
      {children}
    </AppShell>
  );
}
