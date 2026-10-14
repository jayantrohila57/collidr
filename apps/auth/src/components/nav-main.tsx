"use client";

import {
  ChevronRight,
  FolderClosedIcon,
  LayoutDashboardIcon,
  type LucideIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
    isActive?: boolean;
    icon?: LucideIcon;
  }[];
}

export function useIsActive() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (url: string, strict = false) => {
    const [targetPath, targetQuery = ""] = url.split("?");
    if (strict) {
      if (pathname !== targetPath) return false;
    } else {
      if (pathname === targetPath) {
      } else if (pathname.startsWith(`${targetPath}/`)) {
      } else {
        return false;
      }
    }

    if (targetQuery) {
      const query = new URLSearchParams(targetQuery);
      for (const [key, value] of query.entries()) {
        if (searchParams.get(key) !== value) return false;
      }
    }

    return true;
  };
}
export function NavMain() {
  const isActive = useIsActive();
  const items: NavItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
      isActive: true,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: FolderClosedIcon,
      isActive: true,
    },
  ];
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{"Platform"}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasActiveChild =
            item.items?.some((subItem) => isActive(subItem.url)) || false;
          const isItemActive = isActive(item.url, true) || hasActiveChild;
          const hasChildren = item.items && item.items.length > 0;

          if (!hasChildren) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  render={<Link href={item.url as Route} />}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              defaultOpen={isItemActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger
                  render={<SidebarMenuButton tooltip={item.title} />}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ms-auto h-4 w-4 transition-transform duration-200 group-data-open/collapsible:rotate-90" />
                </CollapsibleTrigger>
                <CollapsiblePanel>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            render={<Link href={subItem.url as Route} />}
                          >
                            {subItem.icon && <subItem.icon />}

                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsiblePanel>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
