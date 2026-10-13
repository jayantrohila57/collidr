"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import {
  formatAppliedFiltersSuccess,
  getDataTableFilterResultCount,
  waitForClientTableRefresh,
} from "./data-table-filter-refetch";

export type UseDataTableFacetedFilterOptions<T extends string = string> = {
  /** Table data refetch after filter state updates (server-driven tables). */
  refetch?: () => Promise<unknown>;
  /** Row count when refetch does not expose a total (client-side tables). */
  getResultCount?: (next: T[]) => number | undefined;
  /** Sync table skeleton/loading while Apply or Clear runs. */
  onApplyingChange?: (isApplying: boolean) => void;
};

export function useDataTableFacetedFilter<T extends string>(
  applied: T[],
  onApply: (value: T[]) => void | Promise<void>,
  options: UseDataTableFacetedFilterOptions<T> = {},
) {
  const { refetch, getResultCount, onApplyingChange } = options;
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<T[]>(applied);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (open) {
      setPending(applied);
    }
  }, [open, applied]);

  useEffect(() => {
    onApplyingChange?.(isApplying);
  }, [isApplying, onApplyingChange]);

  const runApply = useCallback(
    async (next: T[], intent: "apply" | "clear") => {
      setIsApplying(true);
      try {
        if (intent === "clear") {
          await toast.promise(
            (async () => {
              await onApply(next);
              if (refetch) {
                await refetch();
              } else {
                await waitForClientTableRefresh();
              }
            })(),
            {
              loading: "Clearing filters…",
              success: "Filters cleared",
              error: "Failed to clear filters",
            },
          );
          return;
        }

        await toast.promise(
          (async (): Promise<number | undefined> => {
            await onApply(next);
            let count: number | undefined;
            if (refetch) {
              const result = await refetch();
              count = getDataTableFilterResultCount(result);
            } else {
              await waitForClientTableRefresh();
            }
            if (count === undefined && getResultCount) {
              count = getResultCount(next);
            }
            return count;
          })(),
          {
            loading: "Applying filters…",
            success: (count) => formatAppliedFiltersSuccess(count),
            error: "Failed to apply filters",
          },
        );
      } finally {
        setIsApplying(false);
      }
    },
    [getResultCount, onApply, refetch],
  );

  const applyPending = useCallback(async () => {
    await runApply(pending, "apply");
    setOpen(false);
  }, [pending, runApply]);

  const clearFilter = useCallback(async () => {
    setPending([]);
    await runApply([], "clear");
    setOpen(false);
  }, [runApply]);

  return {
    open,
    setOpen,
    pending,
    setPending,
    isApplying,
    applyPending,
    clearFilter,
  };
}
