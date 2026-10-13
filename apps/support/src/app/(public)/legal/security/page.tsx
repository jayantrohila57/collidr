import { LegalDocument } from "@/domain/legal/legal-document";
import { PlaceholderLegalBody } from "@/domain/legal/placeholder-body";

export default function SecurityPage() {
  return (
    <LegalDocument title="Security">
      <PlaceholderLegalBody topic="Security overview" />
    </LegalDocument>
  );
}
