"use client";

import { accountSettingsNav } from "@env-manager/actions/nav";
import type { LucideIcon } from "lucide-react";
import {
  ActivityIcon,
  BellIcon,
  GithubIcon,
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
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
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
    <Sidebar collapsible="none" variant="inset" {...props}>
      <SidebarHeader className="shrink-0 border-sidebar-border border-b px-2 py-3">
        <p className="px-2 font-medium text-sm">Account</p>
        <p className="px-2 text-muted-foreground text-xs">
          Profile, security, and preferences
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
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
      <SidebarRail />
    </Sidebar>
  );
}
