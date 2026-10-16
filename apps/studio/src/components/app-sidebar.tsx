"use client";

import { type PlatformNavKey, platformNav } from "@loftlancer/actions/nav";
import {
  NavCountBadge,
  SidebarBrand,
  SidebarFavorites,
  SidebarSearch,
  SidebarUserMenu,
} from "@loftlancer/ui/patterns/sidebar-kit";
import type { LucideIcon } from "lucide-react";
import {
  ActivityIcon,
  BellIcon,
  Building2,
  FolderClosedIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { OrgSwitcher } from "@/components/org/org-switcher";
import { useSidebarNavigator } from "@/components/sidebar/use-sidebar-navigator";
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useUserMenuProps } from "@/domain/auth/components/user-menu";
import { useNotificationsUnreadCount } from "@/domain/notifications/hooks/use-notifications";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { useProjects } from "@/domain/projects/hooks/use-projects";
import { accountSettingsUrl } from "@/lib/account-url";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import { withBasePath } from "@/lib/base-path";
import { isNotificationsEnabledOnClient } from "@/lib/notifications-enabled";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { platformNavHref, routes } from "@/utils/navigation";
import { useRouteScope } from "@/utils/use-route-scope";

const accountSettingsHref = accountSettingsUrl();
const projectHref = (org: string, slug: string) => routes.project(org, slug);
const envHref = (org: string, p: string, e: string) => routes.env(org, p, e);
const memberHref = (org: string) => routes.orgSection(org, "members");

const navIcons: Record<PlatformNavKey, LucideIcon> = {
  organizations: Building2,
  projects: FolderClosedIcon,
  activity: ActivityIcon,
  notifications: BellIcon,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready: _userMenuReady, ...userMenuProps } = useUserMenuProps();
  const scope = useRouteScope();
  const settingsLinks = [
    { label: "Account settings", href: accountSettingsHref },
    { label: "Notifications", href: routes.notifications() },
    { label: "Activity", href: routes.activity() },
    { label: "Support", href: routes.supportTickets() },
    { label: "Organizations", href: routes.home() },
  ];
  const nav = useSidebarNavigator({
    projectHref,
    envHref,
    memberHref,
    settingsLinks,
  });
  const orgSlug = scope.org ?? nav.organizationSlug;
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

  const actionsAudit = isActionsAuditEnabledOnClient();
  const permissions = useCan("organization.list");
  const canTimeline = useCan("audit.timeline.view.org");
  const platformNavLoading = actionsAudit && !initialLoadDone;

  const menuItems = platformNav
    .filter((item) => {
      if (item.key === "notifications") return notificationsEnabled;
      if (item.key === "organizations") {
        return (
          showOrgSwitcher &&
          (!actionsAudit || permissions.allowed || permissions.isLoading)
        );
      }
      if (item.key === "activity" && actionsAudit) {
        return canTimeline.allowed || canTimeline.isLoading;
      }
      return true;
    })
    .flatMap((item) => {
      const href = platformNavHref(item.key, orgSlug);
      if (!href) return [];
      return [
        {
          key: item.key,
          href: href as Route,
          label: item.label,
          icon: navIcons[item.key],
          count:
            item.key === "notifications"
              ? notificationCount
              : item.key === "projects"
                ? nav.counts?.projects
                : item.key === "organizations"
                  ? nav.counts?.pendingInvites
                  : 0,
        },
      ];
    });

  const pathMatchesNavItem = (href: string) => {
    if (pathname === href) return true;
    if (href === routes.home()) return false;
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
        <SidebarBrand href={withBasePath(routes.home())} />
        {showOrgSwitcher ? <OrgSwitcher /> : null}
        <SidebarSearch
          groups={nav.groups}
          loading={nav.loading}
          onNavigate={navigate}
        />
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
                    const count = item.count;
                    return (
                      <SidebarMenuItem key={item.key} className="relative">
                        <SidebarMenuButton
                          isActive={isActive(item.href)}
                          tooltip={item.label}
                          render={<Link href={item.href} />}
                        >
                          <Icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                        <NavCountBadge
                          count={count}
                          tone={
                            item.key === "notifications" ? "alert" : "muted"
                          }
                        />
                      </SidebarMenuItem>
                    );
                  })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFavorites
          items={nav.favorites}
          isActive={(href) =>
            pathname === href || pathname.startsWith(`${href}/`)
          }
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
        <SidebarUserMenu {...userMenuProps} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
