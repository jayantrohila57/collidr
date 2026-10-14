import { buildSignInUrl } from "@collidr/ui/auth-links";
import { MarketingLanding } from "@collidr/ui/marketing";

import { ModeToggle } from "@/components/mode-toggle";

export const metadata = {
  title: "Collidr",
  description: "Organizations, projects, environments, and MCP for agentic workflows.",
};

export default function HomePage() {
  const signInHref = buildSignInUrl();

  return (
    <MarketingLanding signInHref={signInHref} headerActions={<ModeToggle />} />
  );
}
