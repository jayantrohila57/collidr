import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";
import ProjectDetailPage from "@/domain/projects/components/project-detail-page";
import { loadProjectPageDataOrNotFound } from "@/lib/page-guards";
import ProjectDetailLoading from "./loading";

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { loadProjectPageData } = await import("@/lib/project-page-loader");
  const data = await loadProjectPageData(slug);

  if (!data) {
    return {
      title: "Project",
      description: "Manage project environments and variables.",
    };
  }

  return {
    title: data.name,
    description:
      data.description ?? `Manage environments and variables for ${data.name}.`,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const data = await loadProjectPageDataOrNotFound(slug);

  return (
    <HydrationBoundary state={data.dehydratedState}>
      <Suspense fallback={<ProjectDetailLoading />}>
        <ProjectDetailPage
          slug={slug}
          initialName={data.name}
          initialDescription={data.description}
        />
      </Suspense>
    </HydrationBoundary>
  );
}
