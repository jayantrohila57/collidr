import DashboardSection from "@/components/section-dashboard";
import Shell from "@/components/shell";
import { ProjectDetailSkeleton } from "@/domain/environments/components/skeletons";

export default function ProjectDetailLoading() {
  return (
    <Shell>
      <Shell.Section variant="dashboard" padding="dashboard" scale="full">
        <DashboardSection
          title="Project"
          description="Loading project details…"
        >
          <ProjectDetailSkeleton />
        </DashboardSection>
      </Shell.Section>
    </Shell>
  );
}
