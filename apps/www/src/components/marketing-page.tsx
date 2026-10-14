import { buildSignInUrl } from "@loftlancer/ui/auth-links";
import { marketingContainerClass } from "@loftlancer/ui/layout-spacing";
import { MarketingPageShell } from "@loftlancer/ui/marketing";
import { cn } from "@loftlancer/ui/utils";
import type { ReactNode } from "react";

import { ModeToggle } from "@/components/mode-toggle";

export function MarketingPage({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const signInHref = buildSignInUrl();

  return (
    <MarketingPageShell signInHref={signInHref} headerActions={<ModeToggle />}>
      <div className={cn(marketingContainerClass, "py-12 md:py-16")}>
        <header className="mx-auto max-w-3xl">
          <h1 className="font-semibold text-3xl tracking-tight md:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 text-lg text-muted-foreground">{description}</p>
          ) : null}
        </header>
        <div className="mx-auto mt-10 max-w-3xl space-y-4 text-muted-foreground [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_h2]:mt-8 [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:text-xl [&_p]:leading-relaxed">
          {children}
        </div>
      </div>
    </MarketingPageShell>
  );
}
