"use client";

import { appRegistry } from "@loftlancer/actions/apps";
import { buildSignInUrl } from "@loftlancer/ui/auth-links";
import { buttonVariants } from "@loftlancer/ui/button";
import {
  Auth5Panel,
  AuthDivider,
  GithubMark as GithubIcon,
} from "@loftlancer/ui/patterns/auth-5";
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
      <ul className="mt-4 flex flex-col divide-y divide-border/60 rounded-xl text-left ring-1 ring-border/60">
        {appRegistry.map((app) => (
          <li key={app.id} className="flex flex-col gap-0.5 px-3 py-2">
            <span className="flex items-center gap-1.5 font-medium text-sm">
              {app.name}
              <span className="rounded-sm bg-muted px-1 text-muted-foreground text-xs">
                App
              </span>
            </span>
            <span className="text-muted-foreground text-xs">
              {app.description}
            </span>
          </li>
        ))}
        <li className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-medium text-sm">Roles and permissions</span>
          <span className="text-muted-foreground text-xs">
            Owner, manager and member roles, with per-project grants, checked on
            every request.
          </span>
        </li>
      </ul>
    </Auth5Panel>
  );
}
