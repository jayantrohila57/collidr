"use client";

import type { LucideIcon } from "lucide-react";
import { ListFilter, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectButton } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type { AppIconName } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { formatDataTableFilterLabel } from "./data-table-filter-label";
import {
  type UseDataTableFacetedFilterOptions,
  useDataTableFacetedFilter,
} from "./use-data-table-faceted-filter";

export type DataTableFacetedFilterOption<T extends string = string> = {
  value: T;
  label?: string;
  icon?: ReactNode;
  count?: number;
};

export type DataTableFacetedFilterProps<T extends string = string> = {
  title: string;
  /** Leading icon on trigger; defaults to filter icon */
  filterIcon?: LucideIcon | AppIconName;
  options: DataTableFacetedFilterOption<T>[];
  value: T[];
  onValueChange: (value: T[]) => void | Promise<void>;
  multiple?: boolean;
  isLoading?: boolean;
  className?: string;
  /** Accessible label for the trigger */
  ariaLabel?: string;
} & UseDataTableFacetedFilterOptions<T>;

function FilterTriggerIcon({
  filterIcon,
}: {
  filterIcon?: LucideIcon | AppIconName;
}) {
  if (!filterIcon) {
    return <ListFilter className="size-4 shrink-0 opacity-80" aria-hidden />;
  }
  if (typeof filterIcon === "string") {
    return (
      <AppIcon name={filterIcon} className="size-4 shrink-0 text-current" />
    );
  }
  const Icon = filterIcon;
  return <Icon className="size-4 shrink-0 opacity-80" aria-hidden />;
}

function optionLabel<T extends string>(
  option: DataTableFacetedFilterOption<T>,
) {
  return option.label ?? formatDataTableFilterLabel(option.value);
}

export function DataTableFacetedFilter<T extends string = string>({
  title,
  filterIcon,
  options,
  value,
  onValueChange,
  multiple = true,
  isLoading = false,
  className,
  ariaLabel,
  refetch,
  getResultCount,
  onApplyingChange,
}: DataTableFacetedFilterProps<T>) {
  const [query, setQuery] = useState("");
  const {
    open,
    setOpen,
    pending,
    setPending,
    isApplying,
    applyPending,
    clearFilter,
  } = useDataTableFacetedFilter(value, onValueChange, {
    refetch,
    getResultCount,
    onApplyingChange,
  });

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) =>
      optionLabel(option).toLowerCase().includes(q),
    );
  }, [options, query]);

  const selectedCount = value.length;

  const toggleOption = (optionValue: T, checked: boolean) => {
    if (multiple) {
      setPending((prev) =>
        checked
          ? [...prev, optionValue]
          : prev.filter((item) => item !== optionValue),
      );
      return;
    }
    setPending(checked ? [optionValue] : []);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <SelectButton
            size="sm"
            className={cn(
              "h-8 w-full min-w-[8.5rem] gap-2 sm:w-auto",
              className,
            )}
            aria-label={ariaLabel ?? title}
          >
            <FilterTriggerIcon filterIcon={filterIcon} />
            <span className="truncate">{title}</span>
            {selectedCount > 0 ? (
              <Badge variant="secondary" size="sm" className="ms-0.5">
                {selectedCount}
              </Badge>
            ) : null}
          </SelectButton>
        }
      />
      <PopoverPopup align="start" className="w-64 p-0">
        <div className="flex flex-col gap-0">
          <div className="border-b p-2">
            <InputGroup className="h-8" data-size="sm">
              <InputGroupAddon>
                <InputGroupText>
                  <Search className="size-4 shrink-0" aria-hidden />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                size="sm"
                placeholder={`Search ${title.toLowerCase()}…`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label={`Search ${title}`}
                className="h-8"
              />
            </InputGroup>
          </div>
          <ScrollArea
            overscrollContain
            scrollbarGutter
            className="max-h-60 min-h-0"
          >
            <div className="p-1">
              {isLoading ? (
                <div className="flex flex-col gap-2 p-2">
                  {(
                    [
                      "filter-skeleton-a",
                      "filter-skeleton-b",
                      "filter-skeleton-c",
                      "filter-skeleton-d",
                      "filter-skeleton-e",
                    ] as const
                  ).map((skeletonKey) => (
                    <div
                      key={skeletonKey}
                      className="flex items-center gap-2 px-1"
                    >
                      <Skeleton className="size-4 shrink-0 rounded-[.25rem]" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  ))}
                </div>
              ) : filteredOptions.length === 0 ? (
                <p className="px-2 py-6 text-center text-muted-foreground text-sm">
                  No results.
                </p>
              ) : (
                filteredOptions.map((option) => {
                  const checked = pending.includes(option.value);
                  const label = optionLabel(option);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className="flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                      onClick={() => toggleOption(option.value, !checked)}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(next) =>
                          toggleOption(option.value, next === true)
                        }
                        aria-label={label}
                        onClick={(event) => event.stopPropagation()}
                      />
                      {option.icon ? (
                        <span className="flex shrink-0 text-muted-foreground">
                          {option.icon}
                        </span>
                      ) : null}
                      <span className="min-w-0 flex-1 truncate">{label}</span>
                      {option.count !== undefined ? (
                        <span className="text-muted-foreground text-xs tabular-nums">
                          {option.count}
                        </span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
          <Separator />
          <div className="flex items-center justify-between gap-2 p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              disabled={
                isApplying || (pending.length === 0 && value.length === 0)
              }
              onClick={() => void clearFilter()}
            >
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 gap-2"
              disabled={isApplying}
              onClick={() => void applyPending()}
            >
              {isApplying ? <Spinner className="size-3.5" /> : null}
              Apply
            </Button>
          </div>
        </div>
      </PopoverPopup>
    </Popover>
  );
}
