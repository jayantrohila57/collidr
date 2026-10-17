"use client";

import { AppRouteErrorPage } from "@loftlancer/ui/patterns/app-route-states";
import { Auth5Panel } from "@loftlancer/ui/patterns/auth-5";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Auth5Panel showTerms={false}>
      <AppRouteErrorPage error={error} reset={reset} />
    </Auth5Panel>
  );
}
