import DashboardSection from "@/components/section-dashboard";
import Shell from "@/components/shell";
import { ProjectsSkeleton } from "@/domain/projects/components/skeletons";

export default function ProjectsLoading() {
  return (
    <Shell>
      <Shell.Section variant="dashboard" padding="dashboard" scale="full">
        <DashboardSection
          title="Projects"
          description="Manage your projects and environment variables"
        >
          <ProjectsSkeleton />
        </DashboardSection>
      </Shell.Section>
    </Shell>
  );
}
