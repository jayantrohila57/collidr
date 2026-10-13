import { DashboardPageSkeleton } from "@/domain/dashboard/components/skeletons";
import { pageStackClass } from "@/lib/page-layout";

export default function DashboardLoading() {
  return (
    <div className={pageStackClass}>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-semibold text-lg tracking-tight">Dashboard</h1>
      </div>
      <DashboardPageSkeleton />
    </div>
  );
}
