"use client";

import { platformNav } from "@env-manager/actions/nav";
import type { LucideIcon } from "lucide-react";
import {
  ActivityIcon,
  BellIcon,
  Building2Icon,
  ClockIcon,
  FolderClosedIcon,
  LayoutDashboardIcon,
  SettingsIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { OrgSwitcher } from "@/components/org/org-switcher";
import { SidebarProjectsGroup } from "@/components/sidebar-projects-group";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useNotificationsUnreadCount } from "@/domain/notifications/hooks/use-notifications";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { useProjects } from "@/domain/projects/hooks/use-projects";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import { isNotificationsEnabledOnClient } from "@/lib/notifications-enabled";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

const navIcons: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboardIcon,
  "/dashboard/projects": FolderClosedIcon,
  "/dashboard/organizations": Building2Icon,
  "/dashboard/timeline": ClockIcon,
  "/dashboard/notifications": BellIcon,
  "/dashboard/settings": SettingsIcon,
  "/dashboard/activity": ActivityIcon,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { isSwitching } = useActiveOrganization();
  const { projects, status, refetch } = useProjects();
  const projectsLoading = isSwitching || status === "loading";
  const showOrgSwitcher = isOrganizationsEnabledOnClient();
  const notificationsEnabled = isNotificationsEnabledOnClient();
  const unreadNotifications = useNotificationsUnreadCount();
  const notificationCount = notificationsEnabled
    ? (unreadNotifications.data?.data ?? 0)
    : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  const actionsAudit = isActionsAuditEnabledOnClient();
  const permissions = useCan("organization.list");
  const canTimeline = useCan("audit.timeline.view.org");

  const menuItems = actionsAudit
    ? platformNav
        .filter((item) => {
          if (
            item.href === "/dashboard/notifications" &&
            !notificationsEnabled
          ) {
            return false;
          }
          if (item.href === "/dashboard/organizations" && !showOrgSwitcher) {
            return false;
          }
          if (!item.action) return true;
          if (item.action === "organization.list") {
            return permissions.allowed;
          }
          if (item.action === "audit.timeline.view.org") {
            return canTimeline.allowed;
          }
          if (item.action === "notification.list") {
            return notificationsEnabled;
          }
          return true;
        })
        .map((item) => ({
          href: item.href,
          label: item.label,
          icon: navIcons[item.href] ?? LayoutDashboardIcon,
          badge:
            item.href === "/dashboard/notifications"
              ? notificationCount
              : undefined,
        }))
    : [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboardIcon,
        },
        {
          href: "/dashboard/projects",
          label: "Projects",
          icon: FolderClosedIcon,
        },
        {
          href: "/dashboard/activity",
          label: "Activity",
          icon: ActivityIcon,
        },
        ...(notificationsEnabled
          ? [
              {
                href: "/dashboard/notifications",
                label: "Notifications",
                icon: BellIcon,
                badge: notificationCount,
              },
            ]
          : []),
      ];

  const pathMatchesNavItem = (href: string) => {
    if (pathname === href) return true;
    if (href === "/dashboard") return false;
    return pathname.startsWith(`${href}/`);
  };

  const isActive = (href: string) => {
    if (!mounted) return false;

    const sortedItems = [...menuItems, { href: "/dashboard/settings" }].sort(
      (a, b) => b.href.length - a.href.length,
    );

    const activeItem = sortedItems.find((item) =>
      pathMatchesNavItem(item.href),
    );

    return activeItem?.href === href;
  };

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      {showOrgSwitcher ? (
        <SidebarHeader className="shrink-0">
          <OrgSwitcher />
        </SidebarHeader>
      ) : null}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex min-w-0 flex-col gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const badge =
                  "badge" in item && typeof item.badge === "number"
                    ? item.badge
                    : 0;
                return (
                  <SidebarMenuItem key={item.href} className="relative">
                    <SidebarMenuButton
                      isActive={isActive(item.href)}
                      tooltip={item.label}
                      render={<Link href={item.href as Route} />}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {badge > 0 ? (
                      <SidebarMenuBadge className="bg-destructive text-destructive-foreground">
                        {badge > 99 ? "99+" : badge}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-2" />

        <SidebarProjectsGroup
          projects={projects}
          projectsLoading={projectsLoading}
          status={status}
          onRetry={() => void refetch()}
        />
      </SidebarContent>

      <SidebarFooter className="mt-auto shrink-0 border-sidebar-border border-t bg-sidebar">
        <SidebarMenu className="flex min-w-0 flex-col gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={isActive("/dashboard/settings")}
              tooltip="Settings"
              render={<Link href={"/dashboard/settings" as Route} />}
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
