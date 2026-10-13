import { PageStack, PageTitleRow } from "@/components/layout/app-layout";
import { StatCardRowSkeleton } from "@/components/patterns/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardPageSkeleton } from "@/domain/dashboard/components/skeletons";

export default function DashboardLoading() {
  return (
    <PageStack>
      <PageTitleRow
        title="Dashboard"
        description="Workspace overview and recent projects."
        action={
          <Skeleton className="size-8 rounded-md sm:h-8 sm:w-auto sm:min-w-[8.5rem]" />
        }
      />
      <StatCardRowSkeleton count={4} />
      <DashboardPageSkeleton />
    </PageStack>
  );
}
