"use client";

import { DashboardAppShell } from "@loftlancer/ui/app-shell";
import { AccountSettingsSidebar } from "@/components/account-settings-sidebar";
import { SettingsBreadcrumbs } from "@/components/settings-breadcrumbs";
import Shell from "@/components/shell";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ModeToggle } from "@/components/mode-toggle";
import { UserMenu } from "@/domain/auth/components/user-menu";

const shellComponents = {
  SidebarInset,
  SidebarTrigger,
  Separator,
};

export function AccountDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Shell>
      <SidebarProvider>
        <TooltipProvider delay={0}>
          <DashboardAppShell
            components={shellComponents}
            sidebar={<AccountSettingsSidebar />}
            breadcrumbs={<SettingsBreadcrumbs className="flex-nowrap" />}
            headerActions={
              <>
                <ModeToggle compact />
                <UserMenu />
              </>
            }
          >
            {children}
          </DashboardAppShell>
        </TooltipProvider>
      </SidebarProvider>
    </Shell>
  );
}
