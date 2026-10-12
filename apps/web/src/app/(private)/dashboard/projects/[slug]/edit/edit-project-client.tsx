"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import Shell from "@/components/shell";
import { ProjectDetailSkeleton } from "@/domain/environments/components/skeletons";
import { trpc } from "@/utils/trpc";

const EditProject = dynamic(
  () =>
    import("@/domain/projects/components/project-edit").then(
      (mod) => mod.EditProject,
    ),
  {
    loading: () => <ProjectDetailSkeleton />,
  },
);

interface EditProjectClientProps {
  slug: string;
}

export default function EditProjectClient({ slug }: EditProjectClientProps) {
  const { data: projectBySlug, isLoading } = useQuery({
    ...trpc.projects.getBySlug.queryOptions({ slug }),
    meta: { toastOnError: false },
  });

  const project = projectBySlug?.data?.project;

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (!project) {
    redirect("/dashboard/projects");
  }

  return (
    <Shell>
      <Shell.Section variant="dashboard" padding="dashboard" scale="full">
        <DashboardSection
          title={`Edit ${project.name}`}
          description="Update project information and settings."
        >
          <EditProject project={project} />
        </DashboardSection>
      </Shell.Section>
    </Shell>
  );
}
