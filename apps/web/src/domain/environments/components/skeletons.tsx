import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectDetailSkeleton() {
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-7 w-32 rounded-md" />
        </div>
        <div className="hidden lg:block">
          <Skeleton className="h-8 w-full max-w-md rounded-lg" />
        </div>
        <div className="lg:hidden">
          <Skeleton className="h-7 w-full rounded-md" />
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-7 w-28 rounded-md" />
          </CardHeader>
          <CardContent>
            <VariablesSkeleton />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export function VariablesSkeleton() {
  return (
    <div className="rounded-md border">
      <div className="border-b px-4 py-3">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="ms-auto h-4 w-1/6" />
        </div>
      </div>
      <div className="space-y-0 divide-y">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4 px-4 py-3">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="ms-auto h-7 w-1/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
