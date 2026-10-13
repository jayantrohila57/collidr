import type { Route } from "next";
import type { AppIconName } from "@/lib/icons";

export type OrganizationSectionId =
  | "members"
  | "teams"
  | "invitations"
  | "roles"
  | "settings"
  | "timeline";

export type OrganizationSectionDefinition = {
  id: OrganizationSectionId;
  title: string;
  description: string;
  icon: AppIconName;
  href: (orgSlug: string) => Route;
};

export const ORGANIZATION_SECTIONS: readonly OrganizationSectionDefinition[] = [
  {
    id: "members",
    title: "Members",
    description: "People in this workspace and their organization roles.",
    icon: "member",
    href: (slug) => `/dashboard/organizations/${slug}/members` as Route,
  },
  {
    id: "teams",
    title: "Teams",
    description: "Group members into teams for access and collaboration.",
    icon: "member",
    href: (slug) => `/dashboard/organizations/${slug}/teams` as Route,
  },
  {
    id: "invitations",
    title: "Invitations",
    description: "Pending email invites awaiting acceptance.",
    icon: "invite",
    href: (slug) => `/dashboard/organizations/${slug}/invitations` as Route,
  },
  {
    id: "roles",
    title: "Roles & access",
    description: "Organization roles and permission policies.",
    icon: "lock",
    href: (slug) => `/dashboard/organizations/${slug}/roles` as Route,
  },
  {
    id: "settings",
    title: "Settings",
    description: "Profile, slug, and danger zone for this workspace.",
    icon: "settings",
    href: (slug) => `/dashboard/organizations/${slug}/settings` as Route,
  },
  {
    id: "timeline",
    title: "Timeline",
    description: "Organization activity and audit history.",
    icon: "activity",
    href: (slug) => `/dashboard/organizations/${slug}/timeline` as Route,
  },
];
