"use client";

import {
  isReservedOrgSlug,
  isReservedProjectSlug,
} from "@loftlancer/ui/studio-routes";
import { useQuery } from "@tanstack/react-query";
import { Home, MoreHorizontal } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { cn, deSlug } from "@/lib/utils";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

const STATIC_LABELS: Record<string, string> = {
  new: "New",
  activity: "Activity",
  onboarding: "Onboarding",
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
  env: "Environments",
  tasks: "Tasks",
  apps: "Apps",
  support: "Support",
  tickets: "Tickets",
  help: "Help",
};

type Crumb = { href: string; segment: string; kind: CrumbKind };
type CrumbKind = "static" | "org" | "project" | "app" | "ticket" | "task";

/**
 * Crumbs follow the URL scope (#299): /[org]/[project]/[app]/…, with the
 * user-level pages (support, notifications, activity) under the root.
 */
function generateBreadcrumbs(pathname: string): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);
  const userLevel = parts[0] ? isReservedOrgSlug(parts[0]) : true;
  return parts.map((segment, index) => {
    const href = `/${parts.slice(0, index + 1).join("/")}`;
    let kind: CrumbKind = "static";
    if (userLevel) {
      if (
        parts[0] === "support" &&
        parts[1] === "tickets" &&
        index === 2 &&
        segment !== "new"
      )
        kind = "ticket";
    } else if (index === 0) kind = "org";
    else if (index === 1 && !isReservedProjectSlug(segment)) kind = "project";
    else if (
      index === 2 &&
      parts[1] &&
      !isReservedProjectSlug(parts[1]) &&
      !["apps", "settings"].includes(segment)
    )
      kind = "app";
    else if (index === 3 && parts[2] === "tasks" && segment !== "settings")
      kind = "task";
    return { href, segment, kind };
  });
}

function formatSegmentLabel(segment: string, resolvedName?: string) {
  if (resolvedName) return resolvedName;
  return STATIC_LABELS[segment] ?? deSlug(segment);
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname ?? "/");
  const { orgs } = useActiveOrganization();
  const { projects } = useProjects();

  const orgSlug = breadcrumbs.find((c) => c.kind === "org")?.segment;
  const projectSlug = breadcrumbs.find((c) => c.kind === "project")?.segment;
  const orgName = orgs.find((o) => o.slug === orgSlug)?.name;
  const projectName = projects.find((p) => p.slug === projectSlug)?.name;

  const supportTicketId = breadcrumbs.find((c) => c.kind === "ticket")?.segment;
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

  const breadcrumbLabel = (crumb: Crumb) =>
    formatSegmentLabel(
      crumb.segment,
      crumb.kind === "org"
        ? orgName
        : crumb.kind === "project"
          ? projectName
          : crumb.kind === "ticket"
            ? supportTicketLabel
            : crumb.kind === "task"
              ? `Task #${crumb.segment}`
              : undefined,
    );

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
            render={<Link href={routes.home()} />}
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
                      {mobileMenuItems.map((crumb) => (
                        <MenuItem
                          key={crumb.href}
                          render={<Link href={crumb.href as Route} />}
                        >
                          {breadcrumbLabel(crumb)}
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
                {breadcrumbLabel(breadcrumbs[lastIndex])}
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

          const label = breadcrumbLabel(breadcrumb);

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
                    render={<Link href={breadcrumb.href as Route} />}
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
