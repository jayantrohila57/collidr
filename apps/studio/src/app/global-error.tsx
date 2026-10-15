"use client";

import "../index.css";
import { AppGlobalErrorPage } from "@loftlancer/ui/patterns/app-route-states";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AppGlobalErrorPage error={error} reset={reset} />;
}
