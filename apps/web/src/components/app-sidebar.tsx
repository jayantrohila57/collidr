"use client";

import {
  ActivityIcon,
  FolderClosedIcon,
  FolderIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  X,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { OrgSwitcher } from "@/components/org/org-switcher";
import { Button } from "@/components/ui/button";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { useProjects } from "@/domain/projects/hooks/use-projects";
import { siteConfig } from "@/lib/siteConfig";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";

function MobileSidebarClose() {
  const { isMobile, setOpenMobile } = useSidebar();
  if (!isMobile) return null;
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-11 shrink-0"
      aria-label="Close sidebar"
      onClick={() => setOpenMobile(false)}
    >
      <X className="size-5" aria-hidden />
    </Button>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { projects, status } = useProjects();

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

    // Sort menu items by length (longest first) to find most specific match
    const sortedItems = [...menuItems].sort(
      (a, b) => b.href.length - a.href.length,
    );

    // Find the first item that matches the current pathname
    const activeItem = sortedItems.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );

    return activeItem?.href === href;
  };

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar" {...props}>
      <SidebarHeader className="pe-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-row items-start gap-2">
            <Avatar className="size-9 shrink-0">
              <AvatarImage src="/favicon/favicon.ico" alt={siteConfig.name} />
              <AvatarFallback>
                {siteConfig.name
                  ? siteConfig.name.slice(0, 2).toUpperCase()
                  : "NA"}
              </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 text-start text-sm leading-tight">
              <span className="truncate font-medium">{siteConfig.name}</span>
              <span className="line-clamp-2 text-xs">
                {siteConfig.description}
              </span>
            </div>
            <MobileSidebarClose />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-2">
          <OrgSwitcher />
        </div>
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
              {status === "loading" && (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <FolderIcon />
                    <span>Loading projects...</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {status === "error" && (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <FolderIcon />
                    <span>Error loading projects</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {status === "success" && projects.length === 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <FolderIcon />
                    <span>No projects yet</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {status === "success" &&
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
