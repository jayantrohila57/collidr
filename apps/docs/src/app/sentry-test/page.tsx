import type { Metadata } from "next";
import { SentryTestTrigger } from "@/components/sentry-test-trigger";

export const metadata: Metadata = {
  title: "Sentry test",
  robots: { index: false, follow: false },
};

/**
 * Browser-side Sentry test error for docs (#354). Docs is a static export,
 * so there is no server to check a secret: this hidden, noindex page throws
 * only when the button is clicked. Not linked anywhere, not in the sitemap.
 */
export default function SentryTestPage() {
  return <SentryTestTrigger />;
}
