"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_DEBOUNCE_MS = 300;

/**
 * Keeps a responsive local value while syncing to the URL (debounced).
 * Avoids search inputs snapping back when router.replace races with typing.
 */
export function useDebouncedUrlParam(
  urlValue: string,
  onCommit: (value: string) => void,
  debounceMs = DEFAULT_DEBOUNCE_MS,
) {
  const [draft, setDraft] = useState(urlValue);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  useEffect(() => {
    setDraft(urlValue);
  }, [urlValue]);

  useEffect(() => {
    return () => {
      if (commitTimer.current) clearTimeout(commitTimer.current);
    };
  }, []);

  const setDraftValue = useCallback(
    (value: string) => {
      setDraft(value);
      if (commitTimer.current) clearTimeout(commitTimer.current);
      commitTimer.current = setTimeout(() => {
        onCommitRef.current(value);
      }, debounceMs);
    },
    [debounceMs],
  );

  return [draft, setDraftValue] as const;
}
