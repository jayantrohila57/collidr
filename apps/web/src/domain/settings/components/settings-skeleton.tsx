import { SettingsPanel } from "@/components/patterns/settings-layout";
import { Skeleton } from "@/components/ui/skeleton";

export function SettingsPageSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <SettingsPanel>
        <div className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-8 w-32 justify-self-start sm:justify-self-end" />
        </div>
        <div className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-28 justify-self-start sm:justify-self-end" />
        </div>
      </SettingsPanel>
    </div>
  );
}
