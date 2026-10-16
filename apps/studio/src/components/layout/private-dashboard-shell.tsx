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
  orgReady = false,
}: {
  children: React.ReactNode;
  /** Server session already has an active org (see OrgOnboardingGate). */
  orgReady?: boolean;
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
        <OrgOnboardingGate initialReady={orgReady}>
          {children}
        </OrgOnboardingGate>
      </AppShell>
    </ActiveOrganizationProvider>
  );
}
