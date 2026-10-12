"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/patterns/error-state";
import { getClientErrorMessage } from "@/lib/errors/client-errors";

export default function RootError({
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
    <div className="flex min-h-svh items-center justify-center p-6">
      <ErrorState
        title="Unexpected error"
        description={getClientErrorMessage(error)}
        onRetry={reset}
      />
    </div>
  );
}
