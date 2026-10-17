import { Skeleton } from "@loftlancer/ui/skeleton";

/** Matches notification preferences card — not the full account settings tab skeleton. */
export function NotificationPreferencesSkeleton() {
  return (
    <div className="rounded-xl border bg-card" role="status" aria-busy="true">
      <div className="space-y-2 border-b px-4 py-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-full max-w-md" />
      </div>
      <div className="px-4 py-4">
        <Skeleton className="h-9 w-44" />
      </div>
    </div>
  );
}
