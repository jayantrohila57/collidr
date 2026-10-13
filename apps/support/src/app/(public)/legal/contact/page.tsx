import { LegalDocument } from "@/domain/legal/legal-document";

export default function LegalContactPage() {
  return (
    <LegalDocument title="Contact">
      <p className="text-muted-foreground text-sm">
        For legal or privacy inquiries, email{" "}
        <a href="mailto:legal@example.com" className="underline">
          legal@example.com
        </a>
        . For product support,{" "}
        <a href="/tickets/new" className="underline">
          open a ticket
        </a>
        .
      </p>
    </LegalDocument>
  );
}
