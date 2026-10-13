import { LegalDocument } from "@/domain/legal/legal-document";
import { PlaceholderLegalBody } from "@/domain/legal/placeholder-body";

export default function PrivacyPage() {
  return (
    <LegalDocument title="Privacy Policy">
      <PlaceholderLegalBody topic="Privacy Policy" />
    </LegalDocument>
  );
}
