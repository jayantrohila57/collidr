"use client";

import { buildSignInUrl } from "@loftlancer/ui/auth-links";
import { buttonVariants } from "@loftlancer/ui/button";
import { GithubMark as GithubIcon } from "@loftlancer/ui/patterns/auth-5";
import { Auth5Panel, AuthDivider } from "@loftlancer/ui/patterns/auth-5";
import { cn } from "@loftlancer/ui/utils";

import { ModeToggle } from "@/components/mode-toggle";

export function Landing() {
  // Static export: plain link into the auth app, which starts the GitHub flow.
  const signInHref = buildSignInUrl({
    returnTo: "https://loftlancer.com/studio/dashboard",
  });

  return (
    <Auth5Panel
      title="Get started with Loftlancer"
      description="Organizations, projects, environments and encrypted variables for your team and your agents."
      topLeft={
        <a href="/docs" className={buttonVariants({ variant: "ghost" })}>
          Docs
        </a>
      }
      topRight={<ModeToggle />}
      footer={
        <>
          <AuthDivider>OR</AuthDivider>
          <div className="grid grid-cols-2 gap-2">
            <a href="/docs" className={buttonVariants({ variant: "outline" })}>
              Read the docs
            </a>
            <a
              href="/pricing"
              className={buttonVariants({ variant: "outline" })}
            >
              Pricing
            </a>
          </div>
        </>
      }
    >
      <a
        href={signInHref}
        data-testid="marketing-cta-bottom"
        className={cn(buttonVariants(), "w-full")}
      >
        <GithubIcon aria-hidden />
        Sign in with GitHub
      </a>
    </Auth5Panel>
  );
}
