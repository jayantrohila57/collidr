"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Button } from "../components/ui/button";

/**
 * Optional-analytics consent (GA4 on the public site, PostHog in Studio).
 * Stored per browser in localStorage; the apps share one origin, so a single
 * choice covers loftlancer.com, /studio and /auth.
 */
export const ANALYTICS_CONSENT_KEY = "ll_analytics_consent";

export type AnalyticsConsent = "granted" | "denied" | "unset";

const listeners = new Set<() => void>();

function read(): AnalyticsConsent {
  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : "unset";
  } catch {
    return "unset";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === ANALYTICS_CONSENT_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Current consent, or `null` while rendering on the server / before hydration. */
export function useAnalyticsConsent(): [
  AnalyticsConsent | null,
  (value: "granted" | "denied") => void,
] {
  const consent = useSyncExternalStore<AnalyticsConsent | null>(
    subscribe,
    read,
    () => null,
  );
  const set = useCallback((value: "granted" | "denied") => {
    try {
      window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
    } catch {
      // Storage blocked: the choice lasts for this page view only.
    }
    for (const listener of listeners) listener();
  }, []);
  return [consent, set];
}

/**
 * Small fixed banner asking once for optional analytics. Fixed positioning
 * means it never shifts layout; it renders nothing until the browser has
 * read the stored choice, and nothing at all once a choice exists.
 */
export function AnalyticsConsentBanner({
  policyHref = "/legal/cookies",
}: {
  policyHref?: string;
}) {
  const [consent, setConsent] = useAnalyticsConsent();
  if (consent !== "unset") return null;

  return (
    <section
      aria-label="Analytics consent"
      className="fixed inset-x-3 bottom-3 z-50 flex flex-col gap-2 rounded-lg border bg-popover p-3 text-popover-foreground text-sm shadow-lg sm:right-auto sm:max-w-sm"
    >
      <p className="text-muted-foreground">
        We use optional analytics to understand how Loftlancer is used. Nothing
        loads unless you accept.{" "}
        <a href={policyHref} className="underline underline-offset-2">
          Cookie policy
        </a>
      </p>
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => setConsent("denied")}>
          Decline
        </Button>
        <Button size="sm" onClick={() => setConsent("granted")}>
          Accept
        </Button>
      </div>
    </section>
  );
}
