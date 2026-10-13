import { LegalDocument } from "@/domain/legal/legal-document";
import { PlaceholderLegalBody } from "@/domain/legal/placeholder-body";

export default function DpaPage() {
  return (
    <LegalDocument title="Data Processing Agreement (GDPR)">
      <PlaceholderLegalBody topic="Data Processing Agreement" />
    </LegalDocument>
  );
}
