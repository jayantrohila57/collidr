"use client";

import { platformNav } from "@collidr/actions/nav";
import type { LucideIcon } from "lucide-react";
import {
  ActivityIcon,
  BellIcon,
  Building2,
  ClockIcon,
  FolderClosedIcon,
  LayoutDashboardIcon,
  SettingsIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { accountSettingsUrl } from "@/lib/account-url";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import { isNotificationsEnabledOnClient } from "@/lib/notifications-enabled";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

const accountSettingsHref = accountSettingsUrl();

const navIcons: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboardIcon,
  "/dashboard/projects": FolderClosedIcon,
  "/dashboard/organizations": Building2,
  "/dashboard/timeline": ClockIcon,
  "/dashboard/notifications": BellIcon,
  "/dashboard/settings": SettingsIcon,
  "/dashboard/activity": ActivityIcon,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { isSwitching, initialLoadDone } = useActiveOrganization();
  const { projects, status, refetch } = useProjects();
  const projectsLoading = isSwitching || status === "loading";
  const showOrgSwitcher = isOrganizationsEnabledOnClient();
  const notificationsEnabled = isNotificationsEnabledOnClient();
  const unreadNotifications = useNotificationsUnreadCount();
  const notificationCount = notificationsEnabled
    ? (unreadNotifications.data?.data ?? 0)
    : 0;
  const notificationsBadgeLoading =
    notificationsEnabled && unreadNotifications.isPending;

  const actionsAudit = isActionsAuditEnabledOnClient();
  const permissions = useCan("organization.list");
  const canTimeline = useCan("audit.timeline.view.org");
  const platformNavLoading =
    actionsAudit &&
    (!initialLoadDone || permissions.isLoading || canTimeline.isLoading);

  const menuItems = actionsAudit
    ? platformNav
        .filter((item) => {
          // Settings lives in SidebarFooter only (#79).
          if (item.href === "/dashboard/settings") {
            return false;
          }
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
            return permissions.allowed || permissions.isLoading;
          }
          if (item.action === "audit.timeline.view.org") {
            return canTimeline.allowed || canTimeline.isLoading;
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
        ...(showOrgSwitcher
          ? [
              {
                href: "/dashboard/organizations",
                label: "Organizations",
                icon: Building2,
              },
            ]
          : []),
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
    const sortedItems = [...menuItems].sort(
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
              {platformNavLoading
                ? (
                    [
                      "nav-skeleton-a",
                      "nav-skeleton-b",
                      "nav-skeleton-c",
                      "nav-skeleton-d",
                    ] as const
                  ).map((skeletonKey) => (
                    <SidebarMenuItem key={skeletonKey}>
                      <SidebarMenuButton disabled className="opacity-60">
                        <span className="size-4 rounded bg-muted" />
                        <span className="h-4 w-24 rounded bg-muted" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                : menuItems.map((item) => {
                    const Icon = item.icon;
                    const badge =
                      "badge" in item && typeof item.badge === "number"
                        ? item.badge
                        : 0;
                    const showNotificationBadge =
                      item.href === "/dashboard/notifications" &&
                      (badge > 0 || notificationsBadgeLoading);
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
                        {showNotificationBadge ? (
                          <SidebarMenuBadge
                            className={
                              notificationsBadgeLoading && badge === 0
                                ? "opacity-0"
                                : "bg-destructive text-destructive-foreground"
                            }
                          >
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
              isActive={false}
              tooltip="Settings"
              render={
                <a href={accountSettingsHref} rel="noopener noreferrer">
                  <SettingsIcon />
                  <span>Settings</span>
                </a>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
