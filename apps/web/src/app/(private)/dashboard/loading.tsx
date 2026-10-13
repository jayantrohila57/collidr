import { PageStack, PageTitleRow } from "@/components/layout/app-layout";
import { DashboardPageSkeleton } from "@/domain/dashboard/components/skeletons";

export default function DashboardLoading() {
  return (
    <PageStack>
      <PageTitleRow title="Dashboard" />
      <DashboardPageSkeleton />
    </PageStack>
  );
}
