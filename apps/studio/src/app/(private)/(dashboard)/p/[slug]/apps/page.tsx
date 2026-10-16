import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { ProjectAppsDirectory } from "@/domain/apps/components/project-apps-directory";
import { loadProjectPageDataOrNotFound } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Apps",
  description: "Install apps on this project.",
};

export default async function ProjectAppsRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadProjectPageDataOrNotFound(slug);
  return (
    <HydrationBoundary state={data.dehydratedState}>
      <ProjectAppsDirectory slug={slug} />
    </HydrationBoundary>
  );
}
