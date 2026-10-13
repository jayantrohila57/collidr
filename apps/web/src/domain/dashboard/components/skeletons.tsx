import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPageSkeleton() {
  return (
    <div
      className="space-y-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="rounded-lg border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Skeleton className="size-14 shrink-0 rounded-full sm:size-20" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-7 w-64 max-w-full sm:h-8" />
              <Skeleton className="h-4 w-80 max-w-full" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {["a", "b", "c", "d", "e", "f"].map((id) => (
          <div
            key={`dashboard-stat-skeleton-${id}`}
            className="rounded-lg border bg-card"
          >
            <div className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 md:p-6 md:pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-6 rounded-md" />
            </div>
            <div className="space-y-2 p-4 pt-0 md:p-6 md:pt-0">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
