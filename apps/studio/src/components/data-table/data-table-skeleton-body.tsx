"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

interface DataTableSkeletonBodyProps {
  columnCount: number;
  rows?: number;
}

const SKELETON_ROW_IDS = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8"];
const SKELETON_CELL_IDS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];

export function DataTableSkeletonBody({
  columnCount,
  rows = 5,
}: DataTableSkeletonBodyProps) {
  const rowIds = SKELETON_ROW_IDS.slice(0, rows);
  const cellIds = SKELETON_CELL_IDS.slice(0, columnCount);

  return (
    <>
      {rowIds.map((rowId) => (
        <TableRow key={`skeleton-row-${rowId}`}>
          {cellIds.map((cellId) => (
            <TableCell key={`skeleton-cell-${rowId}-${cellId}`}>
              <Skeleton className="h-4 w-full max-w-[12rem]" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
