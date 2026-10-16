import type { Route } from "next";
import type { OrgListItem } from "@/components/org/active-organization-context";

const ORG_SECTION = /^\/dashboard\/organizations\/([^/]+)(\/.*)?$/;
const PROJECT_SECTION = /^\/p\/([^/]+)(\/.*)?$/;

export function pathAfterOrganizationSwitch(
  pathname: string,
  nextOrg: OrgListItem | undefined,
  projectSlugs: ReadonlySet<string>,
): Route | null {
  if (!nextOrg) {
    return "/dashboard" as Route;
  }

  const orgMatch = ORG_SECTION.exec(pathname);
  if (orgMatch && orgMatch[1] !== nextOrg.slug) {
    const rest = orgMatch[2] ?? "";
    return `/dashboard/organizations/${nextOrg.slug}${rest}` as Route;
  }

  const projectMatch = PROJECT_SECTION.exec(pathname);
  if (projectMatch) {
    const slug = projectMatch[1];
    if (slug === "new") return null;
    if (!projectSlugs.has(slug)) {
      return "/dashboard/projects" as Route;
    }
  }

  return null;
}
