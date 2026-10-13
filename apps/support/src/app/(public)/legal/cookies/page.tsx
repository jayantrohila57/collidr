import { LegalDocument } from "@/domain/legal/legal-document";
import { PlaceholderLegalBody } from "@/domain/legal/placeholder-body";

export default function CookiesPage() {
  return (
    <LegalDocument title="Cookie Policy">
      <PlaceholderLegalBody topic="Cookie Policy" />
    </LegalDocument>
  );
}
