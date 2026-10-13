import { guardOrganizationSlugPage } from "@/lib/page-guards";
import { redirectToStudio } from "@/lib/studio-redirect";

export default async function OrganizationTimelineRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await guardOrganizationSlugPage(slug, "timeline");
  redirectToStudio(`/dashboard/organizations/${slug}/timeline`);
}
