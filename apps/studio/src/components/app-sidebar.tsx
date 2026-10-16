"use client";

import { platformNav } from "@loftlancer/actions/nav";
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
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  NavCountBadge,
  SidebarBrand,
  SidebarFavorites,
  SidebarSearch,
  SidebarUserMenu,
} from "@loftlancer/ui/patterns/sidebar-kit";
import { docsSiteUrl } from "@loftlancer/ui/platform-urls";
import { useSidebarNavigator } from "@/components/sidebar/use-sidebar-navigator";
import { performSignOut, useSession } from "@/domain/auth/lib/auth-actions";
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
import { withBasePath } from "@/lib/base-path";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import { isNotificationsEnabledOnClient } from "@/lib/notifications-enabled";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

const accountSettingsHref = accountSettingsUrl();
const projectHref = (slug: string) => `/dashboard/projects/${slug}`;
const envHref = (p: string, e: string) => `/dashboard/projects/${p}/environments?env=${encodeURIComponent(e)}`;
const memberHref = (org: string) => `/dashboard/organizations/${org}/members`;

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const settingsLinks = [
    { label: "Account settings", href: accountSettingsHref },
    { label: "Notifications", href: "/dashboard/notifications" },
    { label: "Activity", href: "/dashboard/timeline" },
    { label: "Organizations", href: "/dashboard/organizations" },
  ];
  const nav = useSidebarNavigator({ projectHref, envHref, memberHref, settingsLinks });
  const navigate = (href: string) => {
    if (/^https?:/.test(href)) window.location.assign(href);
    else router.push(href as Route);
  };
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
  const platformNavLoading = actionsAudit && !initialLoadDone;

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
      <SidebarHeader className="shrink-0 gap-2">
        <SidebarBrand href={withBasePath("/dashboard")} />
        {showOrgSwitcher ? <OrgSwitcher /> : null}
        <SidebarSearch groups={nav.groups} loading={nav.loading} onNavigate={navigate} />
      </SidebarHeader>
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
                    const count =
                      item.href === "/dashboard/notifications"
                        ? notificationCount
                        : item.href === "/dashboard/projects"
                          ? nav.counts?.projects
                          : item.href === "/dashboard/organizations"
                            ? nav.counts?.pendingInvites
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
                        <NavCountBadge
                          count={count}
                          tone={item.href === "/dashboard/notifications" ? "alert" : "muted"}
                        />
                      </SidebarMenuItem>
                    );
                  })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFavorites
          items={nav.favorites}
          isActive={(href) => pathname === href || pathname.startsWith(`${href}/`)}
          LinkComponent={({ href, className, children }) => (
            <Link href={href as Route} className={className}>
              {children}
            </Link>
          )}
        />

        <SidebarSeparator className="mx-2" />

        <SidebarProjectsGroup
          isPinned={nav.isPinned}
          onTogglePin={nav.togglePin}
          pinPending={nav.pinPending}
          projects={projects}
          projectsLoading={projectsLoading}
          status={status}
          onRetry={() => void refetch()}
        />
      </SidebarContent>

      <SidebarFooter className="mt-auto shrink-0 border-sidebar-border border-t bg-sidebar">
        <SidebarUserMenu
          user={session?.user ?? null}
          accountHref={accountSettingsHref}
          organizationSettingsHref={
            showOrgSwitcher && nav.organizationSlug
              ? withBasePath(`/dashboard/organizations/${nav.organizationSlug}/settings`)
              : null
          }
          docsHref={docsSiteUrl()}
          onSignOut={() => performSignOut({ queryClient, router })}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
