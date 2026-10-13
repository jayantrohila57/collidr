import DashboardSection from "@/components/section-dashboard";
import { DashboardPageSkeleton } from "@/domain/dashboard/components/skeletons";

export default function DashboardLoading() {
  return (
    <DashboardSection
      title="Dashboard"
      description="Overview of your environment manager statistics"
      showBack={false}
    >
      <DashboardPageSkeleton />
    </DashboardSection>
  );
}
