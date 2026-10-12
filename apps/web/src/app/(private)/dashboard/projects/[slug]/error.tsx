"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/patterns/error-state";
import { getClientErrorMessage } from "@/lib/errors/client-errors";

export default function ProjectDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title="Project failed to load"
      description={getClientErrorMessage(
        error,
        "We could not load this project.",
      )}
      onRetry={reset}
    />
  );
}
