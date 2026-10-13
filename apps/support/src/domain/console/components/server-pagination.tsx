"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { layoutGapClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

export function ServerPagination({
  offset,
  limit,
  total,
  onOffsetChange,
  className,
}: {
  offset: number;
  limit: number;
  total: number;
  onOffsetChange: (next: number) => void;
  className?: string;
}) {
  const page = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  if (total <= limit) {
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
        Page {page} of {pageCount} · {total} total
      </span>
      <div className={cn("flex items-center", layoutGapClass)}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          disabled={!canPrev}
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
        >
          <ChevronLeft className="size-4" aria-hidden />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          disabled={!canNext}
          onClick={() => onOffsetChange(offset + limit)}
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
