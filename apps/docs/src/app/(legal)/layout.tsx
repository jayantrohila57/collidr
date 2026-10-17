import { PublicLegalShell } from "@/components/public-legal-shell";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLegalShell>{children}</PublicLegalShell>;
}
