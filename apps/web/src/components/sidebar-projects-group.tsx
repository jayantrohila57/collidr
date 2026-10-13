"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { ChevronRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { initialsFromLabel } from "@/lib/initials";
import { prefetchProjectDetail } from "@/lib/prefetch-project-detail";
import { selectSidebarProjects } from "@/lib/sidebar-project-nav";
import { cn } from "@/lib/utils";
import { queryClient } from "@/utils/trpc";

const PROJECTS_GROUP_OPEN_KEY = "env-manager-sidebar-projects-open";
const PROJECTS_LIST_EXPANDED_KEY = "env-manager-sidebar-projects-list-expanded";

function readStoredBoolean(key: string, defaultValue: boolean) {
  if (typeof window === "undefined") return defaultValue;
  const raw = window.localStorage.getItem(key);
  if (raw === "0") return false;
  if (raw === "1") return true;
  return defaultValue;
}

function projectPathActive(pathname: string, slug: string) {
  const href = `/dashboard/projects/${slug}`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarProjectsGroup({
  projects,
  projectsLoading,
  status,
  onRetry,
}: {
  projects: ProjectOutput[];
  projectsLoading: boolean;
  status: "loading" | "error" | "empty" | "success";
  onRetry: () => void;
}) {
  const pathname = usePathname();
  const [groupOpen, setGroupOpen] = useState(true);
  const [listExpanded, setListExpanded] = useState(false);

  useEffect(() => {
    setGroupOpen(readStoredBoolean(PROJECTS_GROUP_OPEN_KEY, true));
    setListExpanded(readStoredBoolean(PROJECTS_LIST_EXPANDED_KEY, false));
  }, []);

  const activeSlug = useMemo(() => {
    const match = pathname.match(/^\/dashboard\/projects\/([^/]+)/);
    return match?.[1] ?? null;
  }, [pathname]);

  const { visible, listToggleVisible } = useMemo(
    () =>
      selectSidebarProjects({
        projects,
        activeSlug,
        listExpanded,
      }),
    [activeSlug, listExpanded, projects],
  );

  const persistGroupOpen = (open: boolean) => {
    setGroupOpen(open);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PROJECTS_GROUP_OPEN_KEY, open ? "1" : "0");
    }
  };

  const persistListExpanded = (open: boolean) => {
    setListExpanded(open);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PROJECTS_LIST_EXPANDED_KEY, open ? "1" : "0");
    }
  };

  return (
    <Collapsible
      open={groupOpen}
      onOpenChange={persistGroupOpen}
      className="group/projects-collapsible"
    >
      <SidebarGroup className="p-2">
        <CollapsibleTrigger
          render={
            <SidebarGroupLabel className="cursor-pointer gap-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
          }
        >
          <span className="min-w-0 flex-1 truncate">Projects</span>
          <ChevronRight
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              groupOpen && "rotate-90",
            )}
            aria-hidden
          />
        </CollapsibleTrigger>
        <CollapsiblePanel>
          <SidebarGroupContent>
            <SidebarMenu className="flex min-w-0 flex-col gap-1">
              {projectsLoading &&
                [62, 68, 74].map((textWidthPercent) => (
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
                    onClick={() => void onRetry()}
                  >
                    <AppIcon name="projectFolder" className="text-current" />
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
                visible.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      isActive={projectPathActive(pathname, project.slug)}
                      tooltip={project.name}
                      render={
                        <Link
                          href={`/dashboard/projects/${project.slug}` as Route}
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
              {!projectsLoading && listToggleVisible && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    type="button"
                    className="text-muted-foreground hover:text-sidebar-accent-foreground"
                    onClick={() => persistListExpanded(!listExpanded)}
                  >
                    <span className="size-5 shrink-0" aria-hidden />
                    <span className="truncate text-sm">
                      {listExpanded ? "Less" : "More"}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsiblePanel>
      </SidebarGroup>
    </Collapsible>
  );
}
