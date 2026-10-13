import { redirectToStudio } from "@/lib/studio-redirect";

export default async function OrganizationTimelineRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirectToStudio(`/dashboard/organizations/${slug}/timeline`);
}
