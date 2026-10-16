import { buildSignInUrl } from "@loftlancer/ui/auth-links";
import { MarketingLanding } from "@loftlancer/ui/marketing";

import { ModeToggle } from "@/components/mode-toggle";

export const metadata = {
  title: "Loftlancer",
  description: "Organizations, projects, environments, and MCP for agentic workflows.",
};

export default function HomePage() {
  const signInHref = buildSignInUrl({
    returnTo: "https://loftlancer.com/studio/dashboard",
  });

  return (
    <MarketingLanding signInHref={signInHref} headerActions={<ModeToggle />} />
  );
}
