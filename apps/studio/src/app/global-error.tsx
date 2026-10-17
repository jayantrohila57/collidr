"use client";

import "../index.css";
import { AppGlobalErrorPage } from "@loftlancer/ui/patterns/app-route-states";
import { Auth5Content, Auth5Frame } from "@loftlancer/ui/patterns/auth-5";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <AppGlobalErrorPage
      error={error}
      reset={reset}
      frame={(card) => (
        <Auth5Frame>
          <Auth5Content>{card}</Auth5Content>
        </Auth5Frame>
      )}
    />
  );
}
