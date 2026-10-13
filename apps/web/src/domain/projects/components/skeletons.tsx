"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import { DataTable } from "@/components/data-table/data-table";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const columnHelper = legacyCreateColumnHelper<ProjectOutput>();
const skeletonColumns = [
  columnHelper.display({ id: "a", header: "Project", cell: () => null }),
  columnHelper.display({ id: "b", header: "Status", cell: () => null }),
  columnHelper.display({ id: "c", header: "Visibility", cell: () => null }),
  columnHelper.display({ id: "d", header: "Updated", cell: () => null }),
  columnHelper.display({ id: "e", header: "Links", cell: () => null }),
  columnHelper.display({ id: "f", header: "Actions", cell: () => null }),
];

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
        <div className="pt-4">
          <DataTable
            columns={skeletonColumns}
            data={[]}
            isLoading
            skeletonRowCount={4}
          />
        </div>
      </div>
    </div>
  );
}
