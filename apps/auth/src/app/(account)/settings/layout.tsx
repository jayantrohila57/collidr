"use client";

import { AccountSettingsSidebar } from "@/components/account-settings-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { layoutInsetXClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-0 flex-1 gap-0">
        <AccountSettingsSidebar className="hidden w-56 shrink-0 md:flex" />
        <SidebarInset className="min-w-0 flex-1 bg-transparent">
          <div
            className={cn("mx-auto w-full max-w-3xl py-2", layoutInsetXClass)}
          >
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
