import { DashboardPageSkeleton } from "@/domain/dashboard/components/skeletons";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-semibold text-lg tracking-tight">Dashboard</h1>
      </div>
      <DashboardPageSkeleton />
    </div>
  );
}
