import { guardProjectSlugPage } from "@/lib/page-guards";

export default async function ProjectSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string; project: string }>;
}) {
  const { project: slug } = await params;
  await guardProjectSlugPage(slug);
  return children;
}
