"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { PageStatusEmpty } from "@/components/layout/page-state";
import { Button } from "@/components/ui/button";
import { getClientErrorMessage } from "@/lib/errors/client-errors";

export default function DashboardRouteError({
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
      title="Dashboard error"
      description={getClientErrorMessage(error)}
      action={
        <Button type="button" size="sm" onClick={reset}>
          Try again
        </Button>
      }
    />
  );
}
