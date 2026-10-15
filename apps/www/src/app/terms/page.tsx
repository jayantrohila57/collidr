import { MarketingPage } from "@/components/marketing-page";

export const metadata = {
  title: "Terms",
  description: "Terms of use for the hosted Loftlancer service.",
};

export default function TermsPage() {
  return (
    <MarketingPage
      title="Terms of use"
      description="Last updated October 2026."
    >
      <h2>Service</h2>
      <p>
        Loftlancer is provided as-is during early access. Features may change as
        the platform split (auth, studio, mcp, docs) rolls out on{" "}
        <code>main</code>.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Do not use the service to store malware, violate others&apos; rights, or
        attempt to bypass encryption, authorization, or rate limits enforced by
        the API and MCP server.
      </p>
      <h2>Secrets</h2>
      <p>
        You are responsible for the configuration and secrets you store. Use
        organization roles, project grants, and OAuth scopes to limit access.
      </p>
      <h2>Availability</h2>
      <p>
        There is no uptime SLA on the free tier. Self-hosters should follow the
        deployment documentation in the docs site.
      </p>
    </MarketingPage>
  );
}
