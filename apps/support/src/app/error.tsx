"use client";

import { AppRouteErrorPage } from "@env-manager/ui/patterns/app-route-states";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AppRouteErrorPage error={error} reset={reset} />;
}
