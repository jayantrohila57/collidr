"use client";

import {
  AnalyticsConsentBanner,
  useAnalyticsConsent,
} from "@loftlancer/ui/patterns/analytics-consent";
import { useEffect } from "react";

/** PostHog project key + host, Studio only (#353). Unset = no banner, no script. */
const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() ?? "";
const posthogHost = (
  process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com"
).replace(/\/$/, "");

type PostHogStub = unknown[] & { _i?: unknown[]; people?: unknown[] };

/**
 * Loads PostHog from its CDN the way the official snippet does (a queued
 * stub that array.js picks up), so Studio carries no extra npm dependency.
 * Session replay masks every input; secrets never leave the page.
 */
function loadPostHog() {
  const w = window as unknown as { posthog?: PostHogStub };
  if (w.posthog) return;
  const stub: PostHogStub = [];
  stub.people = [];
  stub._i = [
    [
      posthogKey,
      {
        api_host: posthogHost,
        person_profiles: "identified_only",
        capture_pageview: "history_change",
        session_recording: { maskAllInputs: true },
      },
    ],
  ];
  w.posthog = stub;
  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `${posthogHost.replace(".i.posthog.com", "-assets.i.posthog.com")}/static/array.js`;
  document.head.appendChild(script);
}

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
