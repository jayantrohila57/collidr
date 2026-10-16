import DashboardSection from "@/components/section-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectDetailSkeleton } from "@/domain/environments/components/skeletons";

export default function ProjectEnvironmentsLoading() {
  return (
    <DashboardSection
      title="Environments"
      description="Variables and secrets per deployment target."
      back="auto"
      action={
        <Skeleton className="size-8 rounded-md sm:h-8 sm:w-auto sm:min-w-[8.5rem]" />
      }
    >
      <ProjectDetailSkeleton />
    </DashboardSection>
  );
}
