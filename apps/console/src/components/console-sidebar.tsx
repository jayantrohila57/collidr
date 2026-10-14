"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ADMIN_NAV_GROUPS,
  isAdminNavItemActive,
} from "@/domain/console/admin-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function ConsoleSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="shrink-0">
        <SidebarGroupLabel className="px-2">Console</SidebarGroupLabel>
      </SidebarHeader>
      <SidebarContent>
        {ADMIN_NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="flex min-w-0 flex-col gap-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isAdminNavItemActive(pathname, item.href)}
                      tooltip={item.label}
                      render={<Link href={item.href as Route} />}
                    >
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
