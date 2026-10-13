import { LegalDocument } from "@/domain/legal/legal-document";
import { PlaceholderLegalBody } from "@/domain/legal/placeholder-body";

export default function TermsPage() {
  return (
    <LegalDocument title="Terms of Service">
      <PlaceholderLegalBody topic="Terms of Service" />
    </LegalDocument>
  );
}
