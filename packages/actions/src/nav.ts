import type { ActionName } from "./types";

export type NavItem = {
  href: string;
  label: string;
  action: ActionName | null;
};

export const platformNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", action: null },
  { href: "/dashboard/projects", label: "Projects", action: "project.read" },
  {
    href: "/dashboard/organizations",
    label: "Organizations",
    action: "organization.list",
  },
  {
    href: "/dashboard/timeline",
    label: "Timeline",
    action: "audit.timeline.view.org",
  },
  {
    href: "/dashboard/notifications",
    label: "Notifications",
    action: "notification.list",
  },
];

/** Studio/web sidebar footer — links out to the account app. */
export const sidebarFooterNav: NavItem = {
  href: "/dashboard/settings",
  label: "Settings",
  action: "profile.view",
};

/** Account app settings sidebar (`apps/account`). */
export const accountSettingsNav: NavItem[] = [
  { href: "/settings/profile", label: "Profile", action: "profile.view" },
  { href: "/settings/security", label: "Security", action: "session.list" },
  { href: "/settings/sessions", label: "Sessions", action: "session.list" },
  {
    href: "/settings/accounts",
    label: "Connected accounts",
    action: "account.list",
  },
  {
    href: "/settings/notifications",
    label: "Notifications",
    action: "notification.list",
  },
  { href: "/settings/danger", label: "Danger zone", action: "account.delete" },
  {
    href: "/settings/timeline",
    label: "Timeline",
    action: "audit.timeline.view.self",
  },
];
