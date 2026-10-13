"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { layoutGapClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

type PaginatedTable = {
  getPageCount: () => number;
  getState: () => { pagination: { pageIndex: number } };
  previousPage: () => void;
  nextPage: () => void;
  getCanPreviousPage: () => boolean;
  getCanNextPage: () => boolean;
};

export function DataTablePagination({
  table,
  className,
}: {
  table: PaginatedTable;
  className?: string;
}) {
  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;

  if (pageCount <= 1) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between text-muted-foreground text-xs",
        layoutGapClass,
        className,
      )}
    >
      <span>
        Page {pageIndex + 1} of {pageCount}
      </span>
      <div className={cn("flex items-center", layoutGapClass)}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="size-4" aria-hidden />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
