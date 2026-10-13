"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ModeToggle } from "@/components/mode-toggle";
import { ActiveOrganizationProvider } from "@/components/org/active-organization-context";
import { OrgOnboardingGate } from "@/components/org/org-onboarding-gate";
import Shell from "@/components/shell";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserMenu } from "@/domain/auth/components/user-menu";

interface OrganizationLayoutProps {
  children: React.ReactNode;
}

export default function OrganizationLayout({
  children,
}: OrganizationLayoutProps) {
  const pathname = usePathname();
  const isOnboarding = pathname === "/dashboard/onboarding";

  if (isOnboarding) {
    return (
      <Shell>
        <TooltipProvider delay={0}>
          <ActiveOrganizationProvider>
            <main
              id="main-content"
              className="flex min-h-svh min-w-0 flex-col bg-background p-4 md:p-6"
            >
              <OrgOnboardingGate>{children}</OrgOnboardingGate>
            </main>
          </ActiveOrganizationProvider>
        </TooltipProvider>
      </Shell>
    );
  }

  return (
    <Shell>
      <SidebarProvider>
        <TooltipProvider delay={0}>
          <ActiveOrganizationProvider>
            <AppSidebar />
            <SidebarInset
              id="main-content"
              className="min-h-svh min-w-0 overflow-x-hidden"
            >
              <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4 md:px-6">
                <div className="flex w-full min-w-0 items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-1 flex-row items-center justify-start gap-2">
                    <SidebarTrigger className="-ms-0.5 size-8 shrink-0" />
                    <Separator
                      orientation="vertical"
                      className="my-auto hidden h-6 lg:block"
                    />
                    <div className="hidden min-w-0 flex-1 lg:block">
                      <Breadcrumbs />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden lg:hidden">
                      <Breadcrumbs className="flex-nowrap" />
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-row items-center justify-end gap-2">
                    <ModeToggle />
                    <UserMenu />
                  </div>
                </div>
              </header>
              <Shell.Main
                variant="dashboard"
                padding="none"
                scale={"dashboard"}
                className="min-w-0 max-w-full overflow-x-hidden"
              >
                <OrgOnboardingGate>{children}</OrgOnboardingGate>
              </Shell.Main>
            </SidebarInset>
          </ActiveOrganizationProvider>
        </TooltipProvider>
      </SidebarProvider>
    </Shell>
  );
}
