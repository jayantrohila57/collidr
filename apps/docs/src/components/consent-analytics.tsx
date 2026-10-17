"use client";

import {
  AnalyticsConsentBanner,
  useAnalyticsConsent,
} from "@loftlancer/ui/patterns/analytics-consent";
import Script from "next/script";

/** GA4 measurement id, public site only (#351). Unset = no banner, no script. */
const rawGaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
const gaId = /^G-[A-Z0-9]+$/.test(rawGaId) ? rawGaId : "";

/**
 * Google Analytics 4, gated twice: it does nothing until
 * NEXT_PUBLIC_GA_MEASUREMENT_ID is set at build time, and then loads only
 * after the visitor accepts the consent banner.
 */
export function ConsentAnalytics() {
  const [consent] = useAnalyticsConsent();
  if (!gaId) return null;

  return (
    <>
      <AnalyticsConsentBanner />
      {consent === "granted" ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","${gaId}");`}
          </Script>
        </>
      ) : null}
    </>
  );
}
