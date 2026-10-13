import DashboardSection from "@/components/section-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectDetailSkeleton } from "@/domain/environments/components/skeletons";

export default function ProjectDetailLoading() {
  return (
    <DashboardSection
      title="Project"
      description="Loading project details…"
      titleAccessory={
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
      }
      action={<Skeleton className="h-9 w-9 rounded-md" />}
    >
      <ProjectDetailSkeleton />
    </DashboardSection>
  );
}
