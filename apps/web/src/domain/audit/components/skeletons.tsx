"use client";

import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import { DataTable } from "@/components/data-table/data-table";

type AuditSkeletonRow = { id: string };

const columnHelper = legacyCreateColumnHelper<AuditSkeletonRow>();
const skeletonColumns = [
  columnHelper.display({ id: "date", header: "Date", cell: () => null }),
  columnHelper.display({ id: "action", header: "Action", cell: () => null }),
  columnHelper.display({ id: "entity", header: "Entity", cell: () => null }),
  columnHelper.display({ id: "details", header: "Details", cell: () => null }),
];

export function AuditSkeleton() {
  return (
    <DataTable
      columns={skeletonColumns}
      data={[]}
      isLoading
      skeletonRowCount={5}
      framed
    />
  );
}
