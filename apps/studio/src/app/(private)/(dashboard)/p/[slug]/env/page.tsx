import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AppGate } from "@/domain/apps/components/app-gate";
import ProjectEnvironmentsPage from "@/domain/projects/components/project-environments-page";
import { loadProjectPageDataOrNotFound } from "@/lib/page-guards";
import { loadProjectPageData } from "@/lib/project-page-loader";
import ProjectEnvironmentsLoading from "./loading";

interface ProjectEnvironmentsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProjectEnvironmentsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadProjectPageData(slug);

  if (!data) {
    return {
      title: "Environments",
      description: "Manage project environments and variables.",
    };
  }

  return {
    title: `${data.name} · Environments`,
    description: `Manage environments and variables for ${data.name}.`,
  };
}

export default async function ProjectEnvironmentsRoute({
  params,
}: ProjectEnvironmentsPageProps) {
  const { slug } = await params;
  const data = await loadProjectPageDataOrNotFound(slug);

  return (
    <HydrationBoundary state={data.dehydratedState}>
      <Suspense fallback={<ProjectEnvironmentsLoading />}>
        <AppGate
          slug={slug}
          appId="env"
          fallback={<ProjectEnvironmentsLoading />}
        >
          <ProjectEnvironmentsPage slug={slug} />
        </AppGate>
      </Suspense>
    </HydrationBoundary>
  );
}
