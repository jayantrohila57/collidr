import { isReservedOrgSlug } from "@loftlancer/ui/studio-routes";
import { HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import {
  guardOrganizationSlugMembership,
  preflightOrgSubtree,
} from "@/lib/page-guards";
import { dehydrateOrgSidebarNavigator } from "@/lib/shell-prefetch";

/**
 * ORG SCOPE (/studio/[org]). Members only (the guard 404s otherwise). The
 * session's active org is synced to the URL org in proxy.ts before render.
 */
export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org: slug } = await params;
  // Route words (old /dashboard, /p/…) can never be an org: 404 without a DB hit.
  if (isReservedOrgSlug(slug)) notFound();
  const { session } = await guardOrganizationSlugMembership(slug);
  await preflightOrgSubtree(slug);
  const dehydratedState = await dehydrateOrgSidebarNavigator(session, slug);
  return (
    <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
  );
}
