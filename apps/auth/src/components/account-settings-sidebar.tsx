"use client";

import { accountSettingsNav, platformNav } from "@loftlancer/actions/nav";
import { GithubIcon } from "@loftlancer/ui/github-icon";
import {
  NavCountBadge,
  SidebarBrand,
  SidebarFavorites,
  SidebarSearch,
  SidebarUserMenu,
} from "@loftlancer/ui/patterns/sidebar-kit";
import { docsSiteUrl } from "@loftlancer/ui/platform-urls";
import { useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  ActivityIcon,
  BellIcon,
  Building2,
  ClockIcon,
  FolderClosedIcon,
  LayoutDashboardIcon,
  LockIcon,
  ShieldIcon,
  SkullIcon,
  UserIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebarNavigator } from "@/components/sidebar/use-sidebar-navigator";
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
import { performSignOut, useSession } from "@/domain/auth/lib/auth-actions";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import { withBasePath } from "@/lib/base-path";
import { isNotificationsEnabledOnClient } from "@/lib/notifications-enabled";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { studioDashboardPath } from "@/lib/studio-url";

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

const projectHref = (slug: string) => studioDashboardPath(`/p/${slug}`);
const envHref = (p: string, e: string) =>
  studioDashboardPath(`/p/${p}/env?env=${encodeURIComponent(e)}`);
const memberHref = (org: string) =>
  studioDashboardPath(`/dashboard/organizations/${org}/members`);

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

  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { ready: _userMenuReady, ...userMenuProps } = useUserMenuProps();
  const nav = useSidebarNavigator({
    projectHref,
    envHref,
    memberHref,
    settingsLinks: items.map((i) => ({ label: i.label, href: i.href })),
  });
  const navigate = (href: string) => {
    if (href.startsWith("/settings")) router.push(href as Route);
    else window.location.assign(href);
  };
  const studioCount = (href: string) =>
    href === "/dashboard/notifications"
      ? nav.counts?.unreadNotifications
      : href === "/dashboard/projects"
        ? nav.counts?.projects
        : href === "/dashboard/organizations"
          ? nav.counts?.pendingInvites
          : 0;

  const isActive = (href: string) => {
    if (href === "/settings/profile") {
      return pathname === "/settings" || pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="shrink-0 gap-2">
        <SidebarBrand href={studioDashboardPath("/dashboard")} />
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
                    <NavCountBadge
                      count={studioCount(item.href)}
                      tone={
                        item.href === "/dashboard/notifications"
                          ? "alert"
                          : "muted"
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFavorites items={nav.favorites} />

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
        <SidebarUserMenu {...userMenuProps} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
