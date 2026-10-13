import DashboardSection from "@/components/section-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewProjectLoading() {
  return (
    <DashboardSection
      title="Create New Project"
      description="Add a new project to organize your environment variables."
    >
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </DashboardSection>
  );
}
