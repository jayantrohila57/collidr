import { LegalDocument } from "@/domain/legal/legal-document";
import { PlaceholderLegalBody } from "@/domain/legal/placeholder-body";

export default function AcceptableUsePage() {
  return (
    <LegalDocument title="Acceptable Use Policy">
      <PlaceholderLegalBody topic="Acceptable Use Policy" />
    </LegalDocument>
  );
}
