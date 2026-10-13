"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { layoutGapClass, layoutToolbarClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

export type DataTableToolbarProps = {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filter?: ReactNode;
  primaryAction?: ReactNode;
  className?: string;
};

export function DataTableToolbar({
  searchPlaceholder = "Search…",
  searchValue,
  onSearchChange,
  filter,
  primaryAction,
  className,
}: DataTableToolbarProps) {
  const showSearch = onSearchChange !== undefined;

  if (!showSearch && !filter && !primaryAction) {
    return null;
  }

  return (
    <div className={cn(layoutToolbarClass, "items-center", className)}>
      {showSearch ? (
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute start-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={searchValue ?? ""}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 ps-8"
            aria-label={searchPlaceholder}
          />
        </div>
      ) : null}
      {filter ? (
        <div
          className={cn("flex shrink-0 flex-wrap items-center", layoutGapClass)}
        >
          {filter}
        </div>
      ) : null}
      {primaryAction ? (
        <div className="flex shrink-0 items-center sm:ms-auto">
          {primaryAction}
        </div>
      ) : null}
    </div>
  );
}
