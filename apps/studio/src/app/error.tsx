"use client";

import { Auth5Content, Auth5Frame } from "@loftlancer/ui/patterns/auth-5";

import { AppRouteErrorPage } from "@loftlancer/ui/patterns/app-route-states";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Auth5Frame>
      <Auth5Content>
        <AppRouteErrorPage error={error} reset={reset} />
      </Auth5Content>
    </Auth5Frame>
  );
}
