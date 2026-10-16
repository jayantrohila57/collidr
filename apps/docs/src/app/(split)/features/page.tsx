import { marketingFeatures } from "@loftlancer/ui/marketing";

import { MarketingPage } from "@/components/marketing-page";

export const metadata = {
  title: "Features",
  description:
    "Encryption, organizations, projects, audit timeline, and MCP access for Loftlancer.",
};

export default function FeaturesPage() {
  return (
    <MarketingPage
      title="Features"
      description="Everything in the product today — grounded in how the studio app and MCP server actually behave."
    >
      <ul className="not-prose grid gap-4 sm:grid-cols-2 lg:grid-cols-6 [&>li:nth-last-child(2)]:lg:col-start-2 [&>li:last-child:nth-child(5)]:lg:col-start-4">
        {marketingFeatures.map((feature) => (
          <li
            key={feature.title}
            className="rounded-lg border bg-card p-5 text-card-foreground lg:col-span-2"
          >
            <h2 className="font-semibold text-base">{feature.title}</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>
      <h2 className="mt-12">Permissions and audit</h2>
      <p>
        Every sensitive operation maps to a canonical action in{" "}
        <code>@loftlancer/actions</code>. The studio API checks{" "}
        <code>requireAction</code> using organization role, optional project
        grants, and action blocks. When <code>ACTIONS_AUDIT_ENABLED</code> is
        on, successful and denied operations can be recorded for the timeline.
      </p>
      <h2 className="mt-8">MCP for agents</h2>
      <p>
        The MCP tool layer (package <code>@loftlancer/mcp</code>
        ) exposes the same action layer over OAuth 2.1. Tools call studio tRPC
        with the authenticated user — scopes gate which tools a token may
        invoke; each call still enforces RBAC.
      </p>
    </MarketingPage>
  );
}
