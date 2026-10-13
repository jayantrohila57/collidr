"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeaderBar, PageHeaderRow } from "@/components/layout/app-layout";
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
import { layoutContentClass } from "@/lib/layout-spacing";

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
              className={`min-h-svh min-w-0 bg-background ${layoutContentClass}`}
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
              <PageHeaderBar>
                <PageHeaderRow>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <SidebarTrigger className="size-8 shrink-0" />
                    <Separator
                      orientation="vertical"
                      className="my-auto hidden h-8 lg:block"
                    />
                    <div className="hidden min-w-0 flex-1 lg:block">
                      <Breadcrumbs />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden lg:hidden">
                      <Breadcrumbs className="flex-nowrap" />
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <ModeToggle />
                    <UserMenu />
                  </div>
                </PageHeaderRow>
              </PageHeaderBar>
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
