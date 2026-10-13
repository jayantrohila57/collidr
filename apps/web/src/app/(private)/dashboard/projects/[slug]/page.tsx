import { auth } from "@env-manager/auth";
import { getOwnedProjectBySlug } from "@env-manager/db";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ProjectDetailSkeleton } from "@/domain/environments/components/skeletons";

const ProjectDetailPage = dynamic(
  () => import("@/domain/projects/components/project-detail-page"),
  {
    loading: () => <ProjectDetailSkeleton />,
  },
);

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

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const projectRecord = await getOwnedProjectBySlug(session.user.id, slug);

  if (!projectRecord) {
    notFound();
  }

  return <ProjectDetailPage slug={slug} initialName={projectRecord.name} />;
}
