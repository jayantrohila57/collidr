"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/patterns/error-state";
import { getClientErrorMessage } from "@/lib/errors/client-errors";

export default function DashboardError({
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
    <div className="p-4">
      <ErrorState
        title="Dashboard error"
        description={getClientErrorMessage(error)}
        onRetry={reset}
      />
    </div>
  );
}
