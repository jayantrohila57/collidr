import { docsSiteUrl } from "@env-manager/ui/platform-urls";

import { MarketingPage } from "@/components/marketing-page";

export const metadata = {
  title: "About",
  description: "What Env Manager is and how the monorepo is structured.",
};

export default function AboutPage() {
  const docs = docsSiteUrl();

  return (
    <MarketingPage
      title="About Env Manager"
      description="A multi-tenant workspace for environment variables, built as a TypeScript monorepo on Vercel and Neon."
    >
      <p>
        Env Manager helps teams store configuration and secrets per project and
        environment. Values are encrypted at rest; the UI masks secrets until an
        authorized user reveals them. Organizations add members, teams, and
        fine-grained project access on top of owner / manager / member roles.
      </p>
      <p>
        The product ships as several apps: studio (dashboard), auth (SSO),
        account (user settings), docs (this documentation site), www
        (marketing), and mcp (agent tools). See the{" "}
        <a href={docs}>documentation</a> for setup and API details.
      </p>
      <p>
        Source code is open on{" "}
        <a
          href="https://github.com/jayantrohila57/env-manager"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        .
      </p>
    </MarketingPage>
  );
}
