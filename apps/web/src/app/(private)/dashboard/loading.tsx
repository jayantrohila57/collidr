import DashboardSection from "@/components/section-dashboard";
import Shell from "@/components/shell";
import { DashboardPageSkeleton } from "@/domain/dashboard/components/skeletons";

export default function DashboardLoading() {
  return (
    <Shell>
      <Shell.Section variant="dashboard" padding="dashboard" scale="full">
        <DashboardSection
          title="Dashboard"
          description="Overview of your environment manager statistics"
        >
          <DashboardPageSkeleton />
        </DashboardSection>
      </Shell.Section>
    </Shell>
  );
}
