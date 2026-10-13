"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/patterns/error-state";
import { getClientErrorMessage } from "@/lib/errors/client-errors";

interface SegmentErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  title: string;
  fallbackDescription?: string;
}

export function SegmentError({
  error,
  reset,
  title,
  fallbackDescription = "We could not load this page.",
}: SegmentErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title={title}
      description={getClientErrorMessage(error, fallbackDescription)}
      onRetry={reset}
    />
  );
}
