"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function OrganizationsListSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
      <Skeleton className="h-10 w-full max-w-md rounded-lg" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
    </div>
  );
}

export function OrganizationDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(
          [
            "section-a",
            "section-b",
            "section-c",
            "section-d",
            "section-e",
            "section-f",
          ] as const
        ).map((id) => (
          <Skeleton key={id} className="h-[7.5rem] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
