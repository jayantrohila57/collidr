import { buildSignInUrl } from "@env-manager/ui/auth-links";
import { MarketingLanding } from "@env-manager/ui/marketing";

import { ModeToggle } from "@/components/mode-toggle";

export default function HomePage() {
  const signInHref = buildSignInUrl();

  return (
    <MarketingLanding signInHref={signInHref} headerActions={<ModeToggle />} />
  );
}
