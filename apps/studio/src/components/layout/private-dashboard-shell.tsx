"use client";

import { AppShell } from "@loftlancer/ui/patterns/app-shell";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ModeToggle } from "@/components/mode-toggle";
import { ActiveOrganizationProvider } from "@/components/org/active-organization-context";
import { OrgOnboardingGate } from "@/components/org/org-onboarding-gate";
import { UserMenu } from "@/domain/auth/components/user-menu";
import { NotificationBell } from "@/domain/notifications/components/notification-bell";
import { NotificationPoller } from "@/domain/notifications/components/notification-poller";

export function PrivateDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ActiveOrganizationProvider>
      <NotificationPoller />
      <AppShell
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
      </AppShell>
    </ActiveOrganizationProvider>
  );
}
