import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPageSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="size-24 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-8 w-64 max-w-full" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {["a", "b", "c", "d", "e", "f"].map((id) => (
          <div
            key={`dashboard-stat-skeleton-${id}`}
            className="rounded-lg border p-4"
          >
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="mt-2 h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
