import { auth } from "@env-manager/auth";
import { getOwnedProjectBySlug } from "@env-manager/db";
import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import ProjectDetailPage from "@/domain/projects/components/project-detail-page";
import { dehydrateProjectDetail } from "@/lib/project-prefetch";

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      title: "Project",
      description: "Manage project environments and variables.",
    };
  }

  const projectRecord = await getOwnedProjectBySlug(session.user.id, slug);

  if (!projectRecord) {
    return {
      title: "Project not found",
    };
  }

  return {
    title: projectRecord.name,
    description:
      projectRecord.description ??
      `Manage environments and variables for ${projectRecord.name}.`,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  const headerList = await headers();
  const session = await auth.api.getSession({
    headers: headerList,
  });

  if (!session?.user) {
    redirect("/");
  }

  const projectRecord = await getOwnedProjectBySlug(session.user.id, slug);

  if (!projectRecord) {
    notFound();
  }

  const dehydratedState = await dehydrateProjectDetail(headerList, slug);

  return (
    <HydrationBoundary state={dehydratedState}>
      <ProjectDetailPage
        slug={slug}
        initialName={projectRecord.name}
        initialDescription={projectRecord.description?.trim() || undefined}
      />
    </HydrationBoundary>
  );
}
