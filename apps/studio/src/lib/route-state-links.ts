import { DEFAULT_STUDIO_URL } from "@collidr/env/platform";
import type { AppRouteStateLinks } from "@collidr/ui/patterns/app-route-states";

const origin = (
  process.env.NEXT_PUBLIC_STUDIO_URL ?? DEFAULT_STUDIO_URL
).replace(/\/$/, "");

export const studioRouteStateLinks: AppRouteStateLinks = {
  homeHref: "/",
  dashboardHref: "/dashboard",
};

export const studioPublicOrigin = origin;
