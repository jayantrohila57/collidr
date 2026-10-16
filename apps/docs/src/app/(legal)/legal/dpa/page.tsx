import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "Data processing" };

export default function DpaPage() {
  return (
    <LegalPage title="Data processing (GDPR)">
      <p>
        Data processing terms for enterprise customers will be published here.
        Self-hosted operators remain responsible for their own DPA obligations.
      </p>
    </LegalPage>
  );
}
