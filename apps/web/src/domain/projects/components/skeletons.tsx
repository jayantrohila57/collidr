import { Skeleton } from "@/components/ui/skeleton";

export function ProjectsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg border bg-input/10">
          <div className="p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-8" />
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton
                  key={j}
                  className="group/card flex min-h-80 w-full flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-card-foreground text-sm shadow-xs ring-foreground/10 has-[>img:first-child]:pt-0 data-[size=sm]:gap-4 data-[size=sm]:py-4 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl"
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
