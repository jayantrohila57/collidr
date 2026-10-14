"use client";

import { Home } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn, deSlug } from "@/lib/utils";

const LABELS: Record<string, string> = {
  dashboard: "Overview",
  users: "Users",
  organizations: "Organizations",
  members: "Members",
  teams: "Teams",
  invitations: "Invitations",
  sessions: "Sessions",
  projects: "Projects",
  environments: "Environments",
  variables: "Variables",
  notifications: "Notifications",
  oauth: "OAuth",
  clients: "Clients",
  tokens: "Tokens",
  "rate-limits": "Rate limits",
  "feature-flags": "Feature flags",
  audit: "Audit",
  support: "Support",
  tickets: "Tickets",
  faq: "FAQ",
};

export function ConsoleBreadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname() ?? "/dashboard";
  const segments = pathname.split("/").filter(Boolean);
  const rest = segments[0] === "dashboard" ? segments.slice(1) : segments;

  const crumbs = rest.map((segment, index) => ({
    segment,
    href: `/dashboard/${rest.slice(0, index + 1).join("/")}`,
    label: LABELS[segment] ?? deSlug(segment),
  }));

  return (
    <Breadcrumb className={cn("min-w-0", className)}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href={"/dashboard" as Route} />}>
            <Home className="size-3.5 shrink-0" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        {crumbs.map((crumb, index) => (
          <span key={crumb.href} className="contents">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {index === crumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  render={<Link href={crumb.href as Route} />}
                >
                  {crumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
