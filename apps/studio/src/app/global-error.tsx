"use client";

import "../index.css";
import { AppGlobalErrorPage } from "@loftlancer/ui/patterns/app-route-states";
import { Auth5Content, Auth5Frame } from "@loftlancer/ui/patterns/auth-5";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
