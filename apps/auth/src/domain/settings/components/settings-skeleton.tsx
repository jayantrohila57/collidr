import { Skeleton } from "@loftlancer/ui/skeleton";
import { SettingsPanel } from "@/components/patterns/settings-layout";

export function SettingsPageSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <SettingsPanel>
        <div className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(12rem,0.32fr)_minmax(0,1fr)] md:items-start md:gap-10">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-8 w-32 justify-self-start sm:justify-self-end" />
        </div>
        <div className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(12rem,0.32fr)_minmax(0,1fr)] md:items-start md:gap-10">
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
