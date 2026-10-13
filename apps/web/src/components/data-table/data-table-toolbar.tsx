"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
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
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2",
        filter ? layoutToolbarClass : "flex-row items-center",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-row items-center gap-2">
        {showSearch ? (
          <InputGroup className="h-8 min-w-0 flex-1" data-size="sm">
            <InputGroupAddon>
              <InputGroupText>
                <Search className="size-4 shrink-0" aria-hidden />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              size="sm"
              value={searchValue ?? ""}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-8"
              aria-label={searchPlaceholder}
            />
          </InputGroup>
        ) : null}
        {primaryAction ? (
          <div className="flex shrink-0 items-center justify-end">
            {primaryAction}
          </div>
        ) : null}
      </div>
      {filter ? (
        <div
          className={cn("flex shrink-0 flex-wrap items-center", layoutGapClass)}
        >
          {filter}
        </div>
      ) : null}
    </div>
  );
}
