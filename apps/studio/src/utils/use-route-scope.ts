"use client";

import { useParams } from "next/navigation";

/** `{ org, project, app }` slugs from the current URL (undefined outside scope). */
export function useRouteScope(): {
  org?: string;
  project?: string;
  app?: string;
} {
  const params = useParams<{ org?: string; project?: string; app?: string }>();
  return {
    org: typeof params?.org === "string" ? params.org : undefined,
    project: typeof params?.project === "string" ? params.project : undefined,
    app: typeof params?.app === "string" ? params.app : undefined,
  };
}

/** Org slug from the URL; throws outside the org scope (programming error). */
export function useOrgSlug(): string {
  const { org } = useRouteScope();
  if (!org) throw new Error("useOrgSlug used outside /[org]");
  return org;
}
