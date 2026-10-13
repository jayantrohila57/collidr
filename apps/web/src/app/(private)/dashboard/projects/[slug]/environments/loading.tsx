import DashboardSection from "@/components/section-dashboard";
import { ProjectDetailSkeleton } from "@/domain/environments/components/skeletons";

export default function ProjectEnvironmentsLoading() {
  return (
    <DashboardSection
      title="Environments"
      description="Variables and secrets per deployment target."
      back="auto"
    >
      <ProjectDetailSkeleton />
    </DashboardSection>
  );
}
