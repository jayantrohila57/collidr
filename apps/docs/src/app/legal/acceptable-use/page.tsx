import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "Acceptable use" };

export default function AcceptableUsePage() {
  return (
    <LegalPage title="Acceptable use">
      <p>
        Do not use Collidr to violate others&apos; rights, bypass authorization,
        or distribute malware. Full acceptable-use language will be added after
        legal review.
      </p>
    </LegalPage>
  );
}
