import DashboardSection from "@/components/section-dashboard";
import { ProjectsSkeleton } from "@/domain/projects/components/skeletons";

export default function ProjectsLoading() {
  return (
    <DashboardSection
      title="Projects"
      description="Manage your projects and environment variables"
      actionLabel="New Project"
      actionHref="/dashboard/projects/new"
    >
      <ProjectsSkeleton />
    </DashboardSection>
  );
}
