import type { Route } from "next";

export type AdminNavItem = {
  href: Route;
  label: string;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

/** Grouped console navigation for platform admin resources. */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Home",
    items: [{ href: "/dashboard", label: "Overview" }],
  },
  {
    label: "Identity",
    items: [
      { href: "/dashboard/users", label: "Users" },
      { href: "/dashboard/organizations", label: "Organizations" },
      { href: "/dashboard/members", label: "Members" },
      { href: "/dashboard/teams", label: "Teams" },
      { href: "/dashboard/invitations", label: "Invitations" },
      { href: "/dashboard/sessions", label: "Sessions" },
    ],
  },
  {
    label: "Projects",
    items: [
      { href: "/dashboard/projects", label: "Projects" },
      { href: "/dashboard/environments", label: "Environments" },
      { href: "/dashboard/variables", label: "Variables" },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/dashboard/notifications", label: "Notifications" },
      { href: "/dashboard/oauth/clients", label: "OAuth clients" },
      { href: "/dashboard/oauth/tokens", label: "OAuth tokens" },
      { href: "/dashboard/rate-limits", label: "Rate limits" },
      { href: "/dashboard/feature-flags", label: "Feature flags" },
    ],
  },
  {
    label: "Compliance",
    items: [{ href: "/dashboard/audit", label: "Audit" }],
  },
];

export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap(
  (group) => group.items,
);

export function isAdminNavItemActive(pathname: string, href: Route): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
