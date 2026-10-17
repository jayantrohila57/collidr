"use client";

import {
  AnalyticsConsentBanner,
  useAnalyticsConsent,
} from "@loftlancer/ui/patterns/analytics-consent";
import { useEffect } from "react";
import { loadPostHog, posthogKey } from "@/lib/posthog";

/**
 * PostHog product analytics, gated twice: nothing happens until
 * NEXT_PUBLIC_POSTHOG_KEY is set at build time, and then it loads only after
 * the user accepts the consent banner.
 */
export function ConsentAnalytics() {
  const [consent] = useAnalyticsConsent();

  useEffect(() => {
    if (posthogKey && consent === "granted") loadPostHog();
  }, [consent]);

  if (!posthogKey) return null;
  return <AnalyticsConsentBanner />;
}
