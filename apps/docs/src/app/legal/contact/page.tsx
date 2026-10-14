import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <LegalPage title="Contact">
      <p>
        For product support, sign in to Studio and open a ticket under Support.
        For legal or privacy requests, contact the repository owner listed on
        GitHub.
      </p>
    </LegalPage>
  );
}
