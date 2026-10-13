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
} from "@/components/ui/sidebar";
import { useProjects } from "@/domain/projects/hooks/use-projects";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { Separator } from "./ui/separator";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { isSwitching } = useActiveOrganization();
  const { projects, status } = useProjects();
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

  const isActive = (href: string) => {
    if (!mounted) return false;
    if (href === pathname) return true;

    const sortedItems = [...menuItems].sort(
      (a, b) => b.href.length - a.href.length,
    );

    const activeItem = sortedItems.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
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
          <Separator className="my-2 group-data-[collapsible=icon]:hidden" />
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-1">
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

        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <Separator className="my-2 group-data-[collapsible=icon]:hidden" />
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-1">
              {projectsLoading &&
                ["a", "b", "c", "d"].map((id) => (
                  <SidebarMenuItem key={`project-skeleton-${id}`}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))}
              {!projectsLoading && status === "error" && (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <FolderIcon />
                    <span>Error loading projects</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {!projectsLoading &&
                status === "success" &&
                projects.length === 0 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
                      <FolderIcon />
                      <span>No projects yet</span>
                    </SidebarMenuButton>
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
                          />
                        }
                      >
                        <FolderIcon />
                        <span>{project.name}</span>
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
