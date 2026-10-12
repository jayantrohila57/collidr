import DashboardSection from "@/components/section-dashboard";
import Shell from "@/components/shell";
import { ProjectsSkeleton } from "@/domain/projects/components/skeletons";

export default function NewProjectLoading() {
  return (
    <Shell>
      <Shell.Section variant="dashboard" padding="dashboard" scale="full">
        <DashboardSection
          title="Create New Project"
          description="Add a new project to organize your environment variables."
        >
          <ProjectsSkeleton />
        </DashboardSection>
      </Shell.Section>
    </Shell>
  );
}
