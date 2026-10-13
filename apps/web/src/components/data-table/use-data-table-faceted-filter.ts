"use client";

import { useCallback, useEffect, useState } from "react";

export function useDataTableFacetedFilter<T extends string>(
  applied: T[],
  onApply: (value: T[]) => void | Promise<void>,
) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<T[]>(applied);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (open) {
      setPending(applied);
    }
  }, [open, applied]);

  const runApply = useCallback(
    async (next: T[]) => {
      setIsApplying(true);
      try {
        await onApply(next);
      } finally {
        setIsApplying(false);
      }
    },
    [onApply],
  );

  const applyPending = useCallback(async () => {
    await runApply(pending);
    setOpen(false);
  }, [pending, runApply]);

  const clearFilter = useCallback(async () => {
    setPending([]);
    await runApply([]);
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
