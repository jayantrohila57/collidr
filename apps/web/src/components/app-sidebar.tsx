"use client";

import {
  FolderClosedIcon,
  FolderIcon,
  LayoutDashboardIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
import { useProjects } from "@/domain/projects/hooks/use-projects";
import { siteConfig } from "@/lib/siteConfig";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";

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
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-row gap-1">
            <Avatar>
              <AvatarImage src="/favicon/favicon.ico" alt={siteConfig.name} />
              <AvatarFallback>
                {siteConfig.name
                  ? siteConfig.name.slice(0, 2).toUpperCase()
                  : "NA"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{siteConfig.name}</span>
              <span className="truncate text-xs">{siteConfig.description}</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <Separator className="my-2" />
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      variant={isActive(item.href) ? "active" : "inActive"}
                      isActive={isActive(item.href)}
                      asChild
                    >
                      <Link href={item.href as Route}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <Separator className="my-2" />
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
                        variant={
                          isActive(`/dashboard/projects/${project.slug}`)
                            ? "active"
                            : "inActive"
                        }
                        isActive={isActive(
                          `/dashboard/projects/${project.slug}`,
                        )}
                        asChild
                      >
                        <Link
                          href={`/dashboard/projects/${project.slug}` as Route}
                        >
                          <FolderIcon />
                          <span>{project.name}</span>
                        </Link>
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
