import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SettingsPageSkeleton() {
  return (
    <div className="flex flex-col gap-2" role="status" aria-busy="true">
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-24" />
          </CardTitle>
        </CardHeader>
        <CardPanel>
          <div className="flex items-center gap-2">
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardPanel>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-20" />
          </CardTitle>
        </CardHeader>
        <CardPanel>
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-40" />
        </CardPanel>
      </Card>
    </div>
  );
}
