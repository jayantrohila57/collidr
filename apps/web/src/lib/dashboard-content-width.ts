export type DashboardContentWidth = "wide" | "narrow";

/** @deprecated All dashboard routes use full inset width. */
export function getDashboardContentWidth(
  _pathname: string,
): DashboardContentWidth {
  return "wide";
}
