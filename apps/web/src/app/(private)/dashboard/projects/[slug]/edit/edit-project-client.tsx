"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import Shell from "@/components/shell";
import { ProjectDetailSkeleton } from "@/domain/environments/components/skeletons";
import { useProjectActions } from "@/domain/projects/hooks/use-project-actions";
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
  // Get the project by slug
  const { data: projectBySlug, isLoading: isLoadingSlug } = useQuery(
    trpc.projects.getBySlug.queryOptions({ slug }),
  );

  // Get project ID safely
  const projectId = projectBySlug?.data?.project?.id;

  // Always call the hook, but it will handle the case when projectId is undefined
  const { project, isLoading } = useProjectActions({
    projectId: projectId || "",
  });

  if (isLoadingSlug || isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (!projectBySlug?.data?.project || !project) {
    redirect("/dashboard/projects");
  }

  return (
    <Shell>
      <Shell.Section variant="dashboard" padding="dashboard" scale="full">
        <DashboardSection
          title="Edit Project"
          description="Update project information and settings."
        >
          <EditProject project={project} />
        </DashboardSection>
      </Shell.Section>
    </Shell>
  );
}
