"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ModeToggle } from "@/components/mode-toggle";
import Shell from "@/components/shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/domain/auth/components/user-menu";
import { siteConfig } from "@/lib/siteConfig";

interface OrganizationLayoutProps {
  children: React.ReactNode;
}

export default function OrganizationLayout({
  children,
}: OrganizationLayoutProps) {
  return (
    <Shell>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex min-h-svh flex-col">
          <div className="flex h-14 shrink-0 items-center gap-2 px-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sm:px-4">
            <div className="flex w-full min-w-0 items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 flex-row items-center justify-start">
                <SidebarTrigger className="-ml-0.5" />
                <Separator
                  orientation="vertical"
                  className="my-auto mr-2 ml-1 data-[orientation=vertical]:h-6"
                />
                <div className="hidden md:block">
                  <Breadcrumbs />
                </div>
                <div className="flex w-full flex-row items-center gap-2 md:hidden">
                  <Avatar>
                    <AvatarImage
                      src="/favicon/favicon.ico"
                      alt={siteConfig.name}
                    />
                    <AvatarFallback>
                      {siteConfig.name
                        ? siteConfig.name.slice(0, 2).toUpperCase()
                        : "NA"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {siteConfig.name}
                    </span>
                    <span className="truncate text-xs">
                      {siteConfig.description}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex w-auto flex-row items-center justify-end gap-4">
                <ModeToggle />
                <UserMenu />
              </div>
            </div>
          </div>
          <Separator />
          <div className="block p-5 md:hidden">
            <Breadcrumbs />
          </div>
          <div className="block md:hidden">
            <Separator />
          </div>
          <Shell.Main variant="dashboard" padding="none" scale={"dashboard"}>
            {children}
          </Shell.Main>
        </SidebarInset>
      </SidebarProvider>
    </Shell>
  );
}
