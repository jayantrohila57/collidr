import { Skeleton } from "@/components/ui/skeleton";

export function SettingsPageSkeleton() {
  return (
    <div className="space-y-6 p-4" role="status" aria-live="polite">
      <Skeleton className="h-8 w-48" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
