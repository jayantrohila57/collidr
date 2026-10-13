"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";

export function OfflineBanner() {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-amber-500/40 border-b bg-amber-500/10 px-4 py-2 text-center text-amber-950 text-sm dark:text-amber-100"
    >
      <WifiOff className="me-2 inline size-4 align-text-bottom" aria-hidden />
      You are offline. Changes will sync when your connection returns.
    </div>
  );
}
