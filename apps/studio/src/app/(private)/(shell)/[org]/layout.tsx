import { guardOrganizationSlugMembership } from "@/lib/page-guards";

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
  await guardOrganizationSlugMembership(slug);
  return children;
}
