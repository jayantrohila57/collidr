import { MarketingPage } from "@/components/marketing-page";

export const metadata = {
  title: "Privacy",
  description: "How Collidr handles account and configuration data.",
};

export default function PrivacyPage() {
  return (
    <MarketingPage
      title="Privacy policy"
      description="Last updated October 2026. This describes product behavior reflected in the codebase."
    >
      <h2>What we store</h2>
      <p>
        When you sign in with GitHub, Better Auth stores your account, session,
        and linked OAuth account metadata. Organizations, projects,
        environments, and variables live in PostgreSQL. Secret variable values
        are encrypted with <code>@collidr/crypto</code> before persistence.
      </p>
      <h2>How we use data</h2>
      <p>
        Data is used to operate the dashboard, enforce permissions, send in-app
        notifications when enabled, and write audit events when audit is
        enabled. We do not sell personal data.
      </p>
      <h2>Third parties</h2>
      <p>
        Hosting (Vercel), database (Neon), and GitHub OAuth are required to run
        the service. MCP clients authenticate via the auth app and receive OAuth
        tokens scoped to the permissions you approve.
      </p>
      <h2>Your choices</h2>
      <p>
        Account settings support session management and account deletion flows
        exposed as user-scoped actions in the registry. Contact the repository
        owner for data requests related to self-hosted deployments.
      </p>
    </MarketingPage>
  );
}
