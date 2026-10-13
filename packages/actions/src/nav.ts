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
  { href: "/dashboard/settings", label: "Settings", action: "profile.view" },
];
