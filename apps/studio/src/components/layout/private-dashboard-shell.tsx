"use client";

import { DashboardAppShell } from "@loftlancer/ui/app-shell";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ModeToggle } from "@/components/mode-toggle";
import { ActiveOrganizationProvider } from "@/components/org/active-organization-context";
import { OrgOnboardingGate } from "@/components/org/org-onboarding-gate";
import Shell from "@/components/shell";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserMenu } from "@/domain/auth/components/user-menu";
import { NotificationBell } from "@/domain/notifications/components/notification-bell";
import { NotificationPoller } from "@/domain/notifications/components/notification-poller";
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const shellComponents = {
  SidebarInset,
  SidebarTrigger,
  Separator,
};

export function PrivateDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Shell>
      <SidebarProvider>
        <TooltipProvider delay={0}>
          <ActiveOrganizationProvider>
            <NotificationPoller />
            <DashboardAppShell
              components={shellComponents}
              sidebar={<AppSidebar />}
              breadcrumbs={<Breadcrumbs className="flex-nowrap lg:flex-wrap" />}
              headerActions={
                <>
                  <NotificationBell />
                  <ModeToggle compact />
                  <UserMenu />
                </>
              }
            >
              <OrgOnboardingGate>{children}</OrgOnboardingGate>
            </DashboardAppShell>
          </ActiveOrganizationProvider>
        </TooltipProvider>
      </SidebarProvider>
    </Shell>
  );
}
