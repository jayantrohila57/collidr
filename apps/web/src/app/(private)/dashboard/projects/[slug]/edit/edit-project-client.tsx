"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { ProjectDetailSkeleton } from "@/domain/environments/components/skeletons";
import { ProjectSettingsSection } from "@/domain/projects/components/project-settings-section";
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
    return (
      <DashboardSection
        title="Edit project"
        description="Update project information and settings."
      >
        <ProjectDetailSkeleton />
      </DashboardSection>
    );
  }

  if (!project) {
    redirect("/dashboard/projects");
  }

  return (
    <DashboardSection
      title={`Edit ${project.name}`}
      description="Update project information and settings."
    >
      <EditProject project={project} embedded />
      <ProjectSettingsSection project={project} />
    </DashboardSection>
  );
}
