"use client";

import { AppRouteErrorPage } from "@collidr/ui/patterns/app-route-states";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AppRouteErrorPage error={error} reset={reset} />;
}
