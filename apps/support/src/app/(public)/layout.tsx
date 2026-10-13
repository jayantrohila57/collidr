import { CookieConsentBanner } from "@/components/cookie-consent";
import { SupportShell } from "@/components/support-shell";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SupportShell>
      {children}
      <CookieConsentBanner />
    </SupportShell>
  );
}
