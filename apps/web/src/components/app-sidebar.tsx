"use client";

import {
  ActivityIcon,
  FolderClosedIcon,
  FolderIcon,
  LayoutDashboardIcon,
  SettingsIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { OrgSwitcher } from "@/components/org/org-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  SidebarMenuSkeleton,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useProjects } from "@/domain/projects/hooks/use-projects";
import { initialsFromLabel } from "@/lib/initials";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { prefetchProjectDetail } from "@/lib/prefetch-project-detail";
import { queryClient } from "@/utils/trpc";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { isSwitching } = useActiveOrganization();
  const { projects, status, refetch } = useProjects();
  const projectsLoading = isSwitching || status === "loading";
  const showOrgSwitcher = isOrganizationsEnabledOnClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
    { href: "/dashboard/projects", label: "Projects", icon: FolderClosedIcon },
    { href: "/dashboard/activity", label: "Activity", icon: ActivityIcon },
    { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
  ];

  const pathMatchesNavItem = (href: string) => {
    if (pathname === href) return true;
    if (href === "/dashboard") return false;
    return pathname.startsWith(`${href}/`);
  };

  const isActive = (href: string) => {
    if (!mounted) return false;

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
        <SidebarHeader>
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

        <SidebarSeparator className="mx-2" />

        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex min-w-0 flex-col gap-1">
              {projectsLoading &&
                [62, 68, 74, 80].map((textWidthPercent) => (
                  <SidebarMenuItem key={`project-skeleton-${textWidthPercent}`}>
                    <SidebarMenuSkeleton
                      showIcon
                      textWidthPercent={textWidthPercent}
                    />
                  </SidebarMenuItem>
                ))}
              {!projectsLoading && status === "error" && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    type="button"
                    onClick={() => void refetch()}
                  >
                    <FolderIcon />
                    <span className="text-xs">
                      Couldn't load — tap to retry
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {!projectsLoading &&
                status === "empty" &&
                projects.length === 0 && (
                  <SidebarMenuItem className="px-2 py-1">
                    <p className="text-muted-foreground text-xs leading-snug">
                      No projects yet
                    </p>
                  </SidebarMenuItem>
                )}
              {!projectsLoading &&
                status === "success" &&
                projects
                  .filter((project) => project.slug?.trim())
                  .map((project) => (
                    <SidebarMenuItem key={project.id}>
                      <SidebarMenuButton
                        isActive={isActive(
                          `/dashboard/projects/${project.slug}`,
                        )}
                        tooltip={project.name}
                        render={
                          <Link
                            href={
                              `/dashboard/projects/${project.slug}` as Route
                            }
                            onMouseEnter={() =>
                              prefetchProjectDetail(queryClient, project.slug)
                            }
                            onFocus={() =>
                              prefetchProjectDetail(queryClient, project.slug)
                            }
                          />
                        }
                      >
                        <Avatar className="size-5 shrink-0">
                          <AvatarFallback className="bg-muted font-medium text-[9px]">
                            {initialsFromLabel(project.name, "PR")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{project.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
