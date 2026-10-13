"use client";

import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import { DataTable } from "@/components/data-table/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { layoutSectionStackClass } from "@/lib/layout-spacing";

type DashboardProjectSkeletonRow = { id: string };

const columnHelper = legacyCreateColumnHelper<DashboardProjectSkeletonRow>();
const skeletonColumns = [
  columnHelper.display({ id: "project", header: "Project", cell: () => null }),
  columnHelper.display({ id: "status", header: "Status", cell: () => null }),
  columnHelper.display({
    id: "visibility",
    header: "Visibility",
    cell: () => null,
  }),
  columnHelper.display({ id: "updated", header: "Updated", cell: () => null }),
  columnHelper.display({ id: "links", header: "Links", cell: () => null }),
  columnHelper.display({ id: "actions", header: "Actions", cell: () => null }),
];

export function DashboardPageSkeleton() {
  return (
    <div
      className={layoutSectionStackClass}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-wrap gap-x-6 gap-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-24" />
      </div>
      <DataTable
        columns={skeletonColumns}
        data={[]}
        isLoading
        skeletonRowCount={5}
        framed
      />
    </div>
  );
}
