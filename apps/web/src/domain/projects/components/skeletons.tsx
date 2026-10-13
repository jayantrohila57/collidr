import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function ProjectCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="size-10 rounded-lg" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-7 rounded-md" />
      </CardFooter>
    </Card>
  );
}

export function ProjectsSkeleton() {
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div>
        <div className="flex items-center gap-2 py-2">
          <Skeleton className="size-2 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-8" />
        </div>
        <Separator />
        <div className="grid gap-4 pt-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {["a", "b", "c", "d"].map((id) => (
            <ProjectCardSkeleton key={id} />
          ))}
        </div>
      </div>
    </div>
  );
}
