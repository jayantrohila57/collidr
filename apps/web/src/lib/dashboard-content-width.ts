export type DashboardContentWidth = "wide" | "narrow";

/** Routes that use a centered narrow column (settings & forms). */
export function getDashboardContentWidth(
  pathname: string,
): DashboardContentWidth {
  if (pathname === "/dashboard/onboarding") return "narrow";
  if (pathname === "/dashboard/settings") return "narrow";
  if (pathname.startsWith("/dashboard/settings/")) return "narrow";
  if (pathname === "/dashboard/projects/new") return "narrow";
  if (/^\/dashboard\/projects\/[^/]+\/edit$/.test(pathname)) return "narrow";
  return "wide";
}
