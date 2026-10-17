import { Skeleton } from "@loftlancer/ui/skeleton";

export function AuthSkeleton() {
  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="flex justify-center">
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}
