"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { Badge } from "../components/ui/badge";
import { buttonVariants } from "../components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "../components/ui/card";
import { marketingContainerClass } from "../lib/layout-spacing";
import { cn } from "../lib/utils";
import { marketingFeatures } from "./features";
import { marketingSiteConfig } from "./site-config";

export type MarketingLandingProps = {
  signInHref: string;
  /** Optional slot for theme toggle (rendered in header). */
  headerActions?: ReactNode;
};

type MarketingLinkButtonProps = ComponentProps<"a"> & {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
};

function MarketingLinkButton({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: MarketingLinkButtonProps) {
  return (
    <a className={cn(buttonVariants({ className, size, variant }))} {...props}>
      {children}
    </a>
  );
}

function SiteHeader({
  signInHref,
  headerActions,
}: {
  signInHref: string;
  headerActions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-50 border-border/60 border-b bg-background/80 backdrop-blur-md">
      <div
        className={cn(
          marketingContainerClass,
          "flex h-14 items-center justify-between gap-4",
        )}
      >
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <img
            src="/favicon/favicon.ico"
            alt=""
            className="size-8 shrink-0 rounded-lg border bg-background object-cover"
            width={32}
            height={32}
          />
          <span className="truncate font-semibold text-sm tracking-tight">
            {marketingSiteConfig.name}
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Primary">
          <MarketingLinkButton
            variant="ghost"
            size="sm"
            href="#features"
            className="hidden scroll-smooth sm:inline-flex"
          >
            Features
          </MarketingLinkButton>
          <MarketingLinkButton
            variant="ghost"
            size="sm"
            href={marketingSiteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </MarketingLinkButton>
          {headerActions}
          <MarketingLinkButton
            size="sm"
            href={signInHref}
            data-testid="marketing-cta-sign-in"
          >
            Sign in
          </MarketingLinkButton>
        </nav>
      </div>
    </header>
  );
}

function HeroSection({ signInHref }: { signInHref: string }) {
  return (
    <section className="relative overflow-hidden border-b">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,--alpha(var(--color-neutral-400)/16%),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,--alpha(var(--color-neutral-500)/22%),transparent)]"
        aria-hidden
      />
      <div
        className={cn(
          marketingContainerClass,
          "relative flex flex-col items-center py-20 text-center md:py-28",
        )}
      >
        <Badge variant="outline" className="mb-6">
          Environment variables, done right
        </Badge>
        <h1
          className="max-w-3xl font-semibold text-4xl tracking-tight md:text-6xl md:leading-[1.08]"
          data-testid="marketing-hero-title"
        >
          {marketingSiteConfig.tagline}
        </h1>
        <p className="mt-5 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
          {marketingSiteConfig.description}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <MarketingLinkButton
            size="lg"
            href={signInHref}
            data-testid="marketing-cta-get-started"
          >
            Get started
            <ArrowRight className="size-4 opacity-80" />
          </MarketingLinkButton>
          <MarketingLinkButton
            size="lg"
            variant="outline"
            href={marketingSiteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </MarketingLinkButton>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section
      id="features"
      className={cn(marketingContainerClass, "scroll-mt-16 py-16 md:py-24")}
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2
          id="features-heading"
          className="font-semibold text-2xl tracking-tight md:text-3xl"
        >
          Built for teams shipping fast
        </h2>
        <p className="mt-3 text-muted-foreground">
          Everything you need to centralize configuration—without sacrificing
          security or clarity.
        </p>
      </div>
      <ul
        className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        data-testid="marketing-features"
      >
        {marketingFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <li key={feature.title}>
              <Card className="h-full transition-colors hover:bg-muted/30">
                <CardHeader>
                  <div className="mb-2 flex size-9 items-center justify-center rounded-lg border bg-muted/40">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CtaSection({ signInHref }: { signInHref: string }) {
  return (
    <section className="border-t bg-muted/30">
      <div
        className={cn(
          marketingContainerClass,
          "flex flex-col items-center py-16 text-center md:py-20",
        )}
      >
        <Card className="w-full max-w-2xl border-border/80 shadow-sm">
          <CardHeader className="items-center text-center">
            <CardTitle className="text-xl md:text-2xl">
              Ready to organize your env vars?
            </CardTitle>
            <CardDescription className="max-w-md text-base">
              Sign in with GitHub to open your studio workspace. Your projects
              and secrets stay encrypted and under your control.
            </CardDescription>
          </CardHeader>
          <CardPanel className="flex justify-center pb-8">
            <MarketingLinkButton
              size="lg"
              href={signInHref}
              data-testid="marketing-cta-bottom"
            >
              Continue with GitHub
            </MarketingLinkButton>
          </CardPanel>
        </Card>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t">
      <div
        className={cn(
          marketingContainerClass,
          "flex flex-wrap items-center justify-between gap-4 py-8 text-muted-foreground text-sm",
        )}
      >
        <span>
          © {new Date().getFullYear()} {marketingSiteConfig.name}
        </span>
        <div className="flex flex-wrap gap-4">
          <a
            href={marketingSiteConfig.links.github}
            className="hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

export function MarketingLanding({
  signInHref,
  headerActions,
}: MarketingLandingProps) {
  return (
    <div
      data-testid="marketing-landing"
      className="flex min-h-svh flex-col bg-background"
    >
      <SiteHeader signInHref={signInHref} headerActions={headerActions} />
      <main className="flex-1">
        <HeroSection signInHref={signInHref} />
        <FeaturesSection />
        <CtaSection signInHref={signInHref} />
      </main>
      <SiteFooter />
    </div>
  );
}
