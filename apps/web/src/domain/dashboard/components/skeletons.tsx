import {
  Card,
  CardAction,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPageSkeleton() {
  return (
    <div
      className="space-y-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-7 w-64 max-w-full" />
          </CardTitle>
        </CardHeader>
        <CardPanel>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <Skeleton className="size-14 rounded-full sm:size-20" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
          </div>
        </CardPanel>
      </Card>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {["a", "b", "c", "d", "e", "f"].map((id) => (
          <Card key={`dashboard-stat-skeleton-${id}`}>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-4 w-24" />
              </CardTitle>
              <CardAction>
                <Skeleton className="size-6 rounded-md" />
              </CardAction>
            </CardHeader>
            <CardPanel>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </CardPanel>
          </Card>
        ))}
      </div>
    </div>
  );
}
