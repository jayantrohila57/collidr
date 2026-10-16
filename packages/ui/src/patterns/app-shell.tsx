"use client";

import type { ReactNode } from "react";

import { DashboardAppShell } from "../app-shell/dashboard-app-shell";
import { Separator } from "../components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { TooltipProvider } from "../components/ui/tooltip";

const shellComponents = { SidebarInset, SidebarTrigger, Separator };

/**
 * The one dashboard shell: shadcn Sidebar + SidebarInset with the sticky
 * header (trigger, breadcrumb, actions). Used by the studio dashboard
 * (incl. org settings) and the auth account settings.
 */
export function AppShell({
  sidebar,
  breadcrumbs,
  headerActions,
  children,
}: {
  sidebar: ReactNode;
  breadcrumbs?: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <TooltipProvider delay={0}>
        <DashboardAppShell
          components={shellComponents}
          sidebar={sidebar}
          breadcrumbs={breadcrumbs}
          headerActions={headerActions}
        >
          {children}
        </DashboardAppShell>
      </TooltipProvider>
    </SidebarProvider>
  );
}
