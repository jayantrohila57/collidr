import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import ProjectEnvironmentsPage from "@/domain/projects/components/project-environments-page";
import { loadProjectPageData } from "@/lib/project-page-loader";
import { getServerSession } from "@/lib/server-auth";
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

  const data = await loadProjectPageData(slug);
  if (!data) {
    const session = await getServerSession();
    if (!session?.user) {
      redirect("/");
    }
    notFound();
  }

  return (
    <HydrationBoundary state={data.dehydratedState}>
      <Suspense fallback={<ProjectEnvironmentsLoading />}>
        <ProjectEnvironmentsPage slug={slug} />
      </Suspense>
    </HydrationBoundary>
  );
}
