import { CookieConsentBanner } from "@/components/cookie-consent";
import { SupportShell } from "@/components/support-shell";
import { guardAuthenticatedPage } from "@/lib/page-guards";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardAuthenticatedPage();
  return (
    <SupportShell>
      {children}
      <CookieConsentBanner />
    </SupportShell>
  );
}
