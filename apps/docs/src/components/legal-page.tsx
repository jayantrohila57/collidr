import { MarketingPage } from "@/components/marketing-page";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <MarketingPage
      title={title}
      description="Placeholder copy for owner legal review — do not rely on this for compliance."
    >
      {children}
    </MarketingPage>
  );
}
