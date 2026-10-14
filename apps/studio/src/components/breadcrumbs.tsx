"use client";

import { Home, MoreHorizontal } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";
import { useProjects } from "@/domain/projects/hooks/use-projects";
import { isRecognizedDashboardPath } from "@/lib/dashboard-path";
import { cn, deSlug } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

const STATIC_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  organizations: "Organizations",
  members: "Members",
  teams: "Teams",
  invitations: "Invitations",
  roles: "Roles & access",
  settings: "Settings",
  profile: "Profile",
  sessions: "Sessions",
  accounts: "Connected accounts",
  export: "Export",
  delete: "Delete account",
  timeline: "Timeline",
  projects: "Projects",
  notifications: "Notifications",
  new: "New Project",
  edit: "Edit",
  environments: "Environments",
  support: "Support",
  tickets: "Tickets",
  help: "Help",
};

const SETTINGS_TAB_SEGMENTS = new Set([
  "profile",
  "sessions",
  "accounts",
  "export",
  "delete",
  "timeline",
  "organization",
]);

function formatSegmentLabel(segment: string, resolvedName?: string) {
  if (resolvedName) return resolvedName;
  return STATIC_LABELS[segment] ?? deSlug(segment);
}

const generateBreadcrumbs = (pathname: string) => {
  const pathArray = pathname?.split("/")?.filter(Boolean);
  const breadcrumbs = pathArray.map((path, index) => {
    const href = `/${pathArray?.slice(0, index + 1)?.join("/")}`;
    return { href, label: path, segment: path };
  });
  return breadcrumbs;
};

function breadcrumbLabel(
  breadcrumb: { segment: string },
  index: number,
  breadcrumbs: ReturnType<typeof generateBreadcrumbs>,
  projectFromList?: { name: string },
  orgFromList?: { name: string },
  showNotFound?: boolean,
  supportTicketLabel?: string,
) {
  if (showNotFound && index === breadcrumbs.length - 1) {
    return "Not found";
  }

  if (
    breadcrumbs[1]?.segment === "settings" &&
    SETTINGS_TAB_SEGMENTS.has(breadcrumb.segment)
  ) {
    return STATIC_LABELS[breadcrumb.segment] ?? deSlug(breadcrumb.segment);
  }

  const isProjectSlug =
    index === 2 &&
    breadcrumbs[1]?.segment === "projects" &&
    !["new", "edit"].includes(breadcrumb.segment);

  const isOrgSlug =
    index === 2 &&
    breadcrumbs[1]?.segment === "organizations" &&
    breadcrumb.segment !== "new";

  const isSupportTicketId =
    index === 3 &&
    breadcrumbs[1]?.segment === "support" &&
    breadcrumbs[2]?.segment === "tickets" &&
    breadcrumb.segment !== "new";

  return formatSegmentLabel(
    breadcrumb.segment,
    isProjectSlug
      ? projectFromList?.name
      : isOrgSlug
        ? orgFromList?.name
        : isSupportTicketId
          ? supportTicketLabel
          : undefined,
  );
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumbs = generateBreadcrumbs(pathname);
  const { orgs } = useActiveOrganization();
  const { projects, status: projectsStatus } = useProjects();
  const projectSlugs = new Set(
    projects.map((p) => p.slug).filter((s): s is string => Boolean(s?.trim())),
  );
  const projectsLoaded =
    projectsStatus === "success" || projectsStatus === "empty";
  const showNotFound =
    pathname != null &&
    !isRecognizedDashboardPath(pathname, projectSlugs, projectsLoaded);

  const projectSlugFromPath = breadcrumbs[2]?.segment;
  const projectFromList =
    projectSlugFromPath &&
    breadcrumbs[1]?.segment === "projects" &&
    !["new", "edit"].includes(projectSlugFromPath)
      ? projects.find((p) => p.slug === projectSlugFromPath)
      : undefined;

  const orgSlugFromPath =
    breadcrumbs[1]?.segment === "organizations"
      ? breadcrumbs[2]?.segment
      : undefined;
  const orgFromList = orgSlugFromPath
    ? orgs.find((o) => o.slug === orgSlugFromPath)
    : undefined;

  const supportTicketId =
    breadcrumbs[1]?.segment === "support" &&
    breadcrumbs[2]?.segment === "tickets" &&
    breadcrumbs[3]?.segment &&
    breadcrumbs[3].segment !== "new"
      ? breadcrumbs[3].segment
      : undefined;
  const supportTicketQuery = useQuery({
    ...trpc.support.getTicket.queryOptions({
      ticketId: supportTicketId ?? "",
    }),
    enabled: Boolean(supportTicketId),
    staleTime: 60_000,
  });
  const supportTicketLabel = supportTicketQuery.data?.ticket
    ? `#${supportTicketQuery.data.ticket.ticketNumber} ${supportTicketQuery.data.ticket.subject}`
    : supportTicketId
      ? "Ticket"
      : undefined;

  const handleBreadcrumbClick = (href: string) => {
    router.push(href as Route);
  };

  const collapseMiddle = breadcrumbs.length > 4;
  const visibleIndices = collapseMiddle
    ? [0, breadcrumbs.length - 2, breadcrumbs.length - 1]
    : breadcrumbs.map((_, i) => i);

  const lastIndex = breadcrumbs.length - 1;
  const mobileMenuItems =
    breadcrumbs.length > 1 ? breadcrumbs.slice(0, -1) : [];

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList
        className={cn("min-w-0 flex-nowrap overflow-hidden", className)}
      >
        <BreadcrumbItem className="shrink-0">
          <BreadcrumbLink
            href={"/"}
            aria-label="Home"
            className="inline-flex size-11 items-center justify-center"
          >
            <Home className="size-4" aria-hidden />
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Mobile: last segment + ellipsis menu for ancestors */}
        {breadcrumbs.length > 0 ? (
          <>
            {mobileMenuItems.length > 0 ? (
              <React.Fragment key="mobile-ellipsis">
                <BreadcrumbSeparator className="shrink-0 md:hidden">
                  {"/"}
                </BreadcrumbSeparator>
                <BreadcrumbItem className="shrink-0 md:hidden">
                  <Menu>
                    <MenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Show breadcrumb trail"
                        />
                      }
                    >
                      <MoreHorizontal className="size-4" aria-hidden />
                    </MenuTrigger>
                    <MenuPopup align="start">
                      {mobileMenuItems.map((crumb, index) => (
                        <MenuItem
                          key={crumb.href}
                          onClick={() => handleBreadcrumbClick(crumb.href)}
                        >
                          {breadcrumbLabel(
                            crumb,
                            index,
                            breadcrumbs,
                            projectFromList,
                            orgFromList,
                            showNotFound,
                            supportTicketLabel,
                          )}
                        </MenuItem>
                      ))}
                    </MenuPopup>
                  </Menu>
                </BreadcrumbItem>
              </React.Fragment>
            ) : null}
            <BreadcrumbSeparator className="shrink-0 md:hidden">
              {"/"}
            </BreadcrumbSeparator>
            <BreadcrumbItem className="max-w-[min(12rem,55vw)] shrink truncate md:hidden">
              <BreadcrumbPage className="truncate">
                {breadcrumbLabel(
                  breadcrumbs[lastIndex],
                  lastIndex,
                  breadcrumbs,
                  projectFromList,
                  orgFromList,
                  showNotFound,
                  supportTicketLabel,
                )}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}

        {/* md+: full trail (with optional middle collapse) */}
        {breadcrumbs?.map((breadcrumb, index) => {
          if (collapseMiddle && index > 0 && index < breadcrumbs.length - 2) {
            if (index === 1) {
              return (
                <React.Fragment key="ellipsis">
                  <BreadcrumbSeparator className="hidden shrink-0 md:flex">
                    {"/"}
                  </BreadcrumbSeparator>
                  <BreadcrumbItem className="hidden shrink-0 text-muted-foreground md:flex">
                    …
                  </BreadcrumbItem>
                </React.Fragment>
              );
            }
            return null;
          }

          if (!visibleIndices.includes(index) && !collapseMiddle) {
            return null;
          }

          const label = breadcrumbLabel(
            breadcrumb,
            index,
            breadcrumbs,
            projectFromList,
            orgFromList,
            showNotFound,
            supportTicketLabel,
          );

          return (
            <React.Fragment key={breadcrumb.href}>
              <BreadcrumbSeparator className="hidden shrink-0 first:hidden md:flex">
                {"/"}
              </BreadcrumbSeparator>
              <BreadcrumbItem className="hidden max-w-32 shrink truncate md:flex md:max-w-xs">
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="truncate">{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="truncate"
                    href={breadcrumb.href}
                    onClick={() => handleBreadcrumbClick(breadcrumb.href)}
                  >
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
