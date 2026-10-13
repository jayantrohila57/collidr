"use client";

import { toast } from "@/lib/toast";
import { waitForClientTableRefresh } from "./data-table-filter-refetch";

/** Clear toolbar filters with the same toast feedback as faceted Apply/Clear. */
export async function runDataTableClearAllFilters(
  clear: () => void | Promise<void>,
): Promise<void> {
  await toast.promise(
    (async () => {
      await clear();
      await waitForClientTableRefresh();
    })(),
    {
      loading: "Clearing filters…",
      success: "Filters cleared",
      error: "Failed to clear filters",
    },
  );
}
