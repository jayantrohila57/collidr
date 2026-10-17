"use client";

import { logger } from "@loftlancer/logger";
import { AppRouteErrorPage } from "@loftlancer/ui/patterns/app-route-states";
import { Auth5Content, Auth5Frame } from "@loftlancer/ui/patterns/auth-5";
import { useEffect } from "react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Route errors reach Sentry Logs (#355). Name, message and digest only.
  useEffect(() => {
    logger.error("Route error boundary", error, { digest: error.digest });
  }, [error]);

  return (
    <Auth5Frame>
      <Auth5Content>
        <AppRouteErrorPage error={error} reset={reset} />
      </Auth5Content>
    </Auth5Frame>
  );
}
