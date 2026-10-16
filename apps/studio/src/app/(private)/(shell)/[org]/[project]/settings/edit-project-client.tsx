"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { ProjectDetailSkeleton } from "@/domain/environments/components/skeletons";
import { ProjectDetailStats } from "@/domain/projects/components/project-detail-stats";
import { ProjectSettingsSection } from "@/domain/projects/components/project-settings-section";
import { useProjectTabs } from "@/domain/projects/hooks/use-project-tabs";
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
  const projectTabs = useProjectTabs(slug);

  if (isLoading) {
    return (
      <DashboardSection
        {...projectTabs}
        title="Settings"
        description="Update project information and settings."
        stats={<ProjectDetailStats slug={slug} />}
      >
        <ProjectDetailSkeleton />
      </DashboardSection>
    );
  }

  if (!project) {
    notFound();
  }

  return (
    <DashboardSection
      {...projectTabs}
      title="Settings"
      description="Update project information and settings."
      stats={<ProjectDetailStats slug={slug} />}
    >
      <div className="flex flex-col gap-4">
        <EditProject project={project} embedded />
        <ProjectSettingsSection project={project} />
      </div>
    </DashboardSection>
  );
}
