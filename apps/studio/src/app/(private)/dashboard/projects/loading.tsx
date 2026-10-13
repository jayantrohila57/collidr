import DashboardSection from "@/components/section-dashboard";
import { ProjectsSkeleton } from "@/domain/projects/components/skeletons";

export default function ProjectsLoading() {
  return (
    <DashboardSection title="Projects">
      <ProjectsSkeleton />
    </DashboardSection>
  );
}
