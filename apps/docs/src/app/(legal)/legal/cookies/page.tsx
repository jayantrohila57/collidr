import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = {
  ...pageMetadata({
    title: "Cookie policy",
    description:
      "How Loftlancer uses cookies and local storage, and how optional analytics consent works.",
    path: "/legal/cookies",
  }),
  // Placeholder copy: kept out of the index and sitemap until reviewed.
  robots: { index: false, follow: true },
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie policy">
      <p>
        This page will describe how Loftlancer uses cookies and similar
        technologies once final legal copy is approved.
      </p>
      <p>
        Signing in sets the session cookies needed to keep you signed in.
        Optional analytics (Google Analytics on the public site, PostHog in
        Studio) stay off until you accept them in the cookie banner. Your choice
        is saved in this browser&apos;s local storage under{" "}
        <code>ll_analytics_consent</code>; clear it to be asked again.
      </p>
    </LegalPage>
  );
}
