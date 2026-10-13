import { redirectToStudio } from "@/lib/studio-redirect";

interface OrganizationHubPageProps {
  params: Promise<{ slug: string }>;
}

export default async function OrganizationHubPage({
  params,
}: OrganizationHubPageProps) {
  const { slug } = await params;
  redirectToStudio(`/dashboard/organizations/${slug}`);
}
