import { guardOrganizationSlugMembership } from "@/lib/page-guards";

export default async function OrganizationSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await guardOrganizationSlugMembership(slug);
  return children;
}
