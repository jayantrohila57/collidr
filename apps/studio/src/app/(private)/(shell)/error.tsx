"use client";

import { Button } from "@loftlancer/ui/button";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { PageStatusEmpty } from "@/components/layout/page-state";
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
    <PageStatusEmpty
      icon={AlertTriangle}
      title="Something went wrong"
      description={getClientErrorMessage(error)}
      action={
        <Button type="button" size="sm" onClick={reset}>
          Try again
        </Button>
      }
    />
  );
}
