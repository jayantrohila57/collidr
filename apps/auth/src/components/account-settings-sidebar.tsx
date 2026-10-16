"use client";

import { accountSettingsNav, platformNav } from "@loftlancer/actions/nav";
import { GithubIcon } from "@loftlancer/ui/github-icon";
import type { LucideIcon } from "lucide-react";
import {
  ActivityIcon,
  BellIcon,
  Building2,
  ClockIcon,
  FolderClosedIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  LockIcon,
  ShieldIcon,
  SkullIcon,
  UserIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { studioDashboardPath } from "@/lib/studio-url";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import { isNotificationsEnabledOnClient } from "@/lib/notifications-enabled";

const navIcons: Record<string, LucideIcon> = {
  "/settings/profile": UserIcon,
  "/settings/security": ShieldIcon,
  "/settings/sessions": LockIcon,
  "/settings/accounts": GithubIcon,
  "/settings/notifications": BellIcon,
  "/settings/danger": SkullIcon,
  "/settings/timeline": ActivityIcon,
};

/** Studio platform nav, mirrored from the studio AppSidebar with absolute /studio URLs. */
const studioNavIcons: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboardIcon,
  "/dashboard/projects": FolderClosedIcon,
  "/dashboard/organizations": Building2,
  "/dashboard/timeline": ClockIcon,
  "/dashboard/notifications": BellIcon,
};

export function AccountSettingsSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const canProfile = useCan("profile.view");
  const canSessions = useCan("session.list");
  const canAccounts = useCan("account.list");
  const canDelete = useCan("account.delete");
  const canTimeline = useCan("audit.timeline.view.self");
  const canNotifications = useCan("notification.list");

  const notificationsEnabled = isNotificationsEnabledOnClient();
  const actionsAudit = isActionsAuditEnabledOnClient();

  const allowedByHref: Record<string, boolean> = {
    "/settings/profile": canProfile.allowed || canProfile.isLoading,
    "/settings/security": canSessions.allowed || canSessions.isLoading,
    "/settings/sessions": canSessions.allowed || canSessions.isLoading,
    "/settings/accounts": canAccounts.allowed || canAccounts.isLoading,
    "/settings/notifications":
      notificationsEnabled &&
      (canNotifications.allowed || canNotifications.isLoading),
    "/settings/danger": canDelete.allowed || canDelete.isLoading,
    "/settings/timeline":
      actionsAudit && (canTimeline.allowed || canTimeline.isLoading),
  };

  const studioItems = platformNav.filter((item) => {
    if (item.href === "/dashboard/notifications") return notificationsEnabled;
    if (item.href === "/dashboard/organizations")
      return isOrganizationsEnabledOnClient();
    if (item.href === "/dashboard/timeline") return actionsAudit;
    return true;
  });

  const items = accountSettingsNav.filter(
    (item) => allowedByHref[item.href] !== false,
  );

  const isActive = (href: string) => {
    if (href === "/settings/profile") {
      return pathname === "/settings" || pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex min-w-0 flex-col gap-1">
              {studioItems.map((item) => {
                const Icon = studioNavIcons[item.href] ?? LayoutDashboardIcon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={false}
                      tooltip={item.label}
                      render={<a href={studioDashboardPath(item.href)} />}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-2" />

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex min-w-0 flex-col gap-1">
              {items.map((item) => {
                const Icon = navIcons[item.href] ?? UserIcon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive(item.href)}
                      tooltip={item.label}
                      render={<Link href={item.href as Route} />}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto shrink-0 border-sidebar-border border-t bg-sidebar">
        <SidebarMenu className="flex min-w-0 flex-col gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive
              tooltip="Settings"
              render={<Link href={"/settings/profile" as Route} />}
            >
              <SettingsIcon />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
