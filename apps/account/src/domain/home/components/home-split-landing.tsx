"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { AppIcon } from "@/components/patterns/app-icon";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { GitHubLoginButton } from "@/domain/auth/components/github-login";
import {
  type HomeLandingFeature,
  homeLandingFeatures,
} from "@/domain/home/home-landing-features";
import {
  layoutGapClass,
  layoutInsetXClass,
  layoutPageTitleClass,
} from "@/lib/layout-spacing";
import { siteConfig } from "@/lib/siteConfig";
import { cn } from "@/lib/utils";

function BrandMark() {
  return (
    <Link
      href="/"
      className="flex min-w-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <img
        src="/favicon/favicon.ico"
        alt=""
        className="size-8 shrink-0 rounded-lg border bg-background object-cover"
        width={32}
        height={32}
      />
      <span className="truncate font-semibold text-sm">{siteConfig.name}</span>
    </Link>
  );
}

function FeatureRow({
  feature,
  compact = false,
}: {
  feature: HomeLandingFeature;
  compact?: boolean;
}) {
  return (
    <li className="flex min-w-0 gap-3">
      <AppIcon
        name={feature.icon}
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
      />
      <div className="min-w-0">
        <p className="font-medium text-sm">{feature.title}</p>
        <p
          className={cn(
            "text-muted-foreground",
            compact ? "text-xs leading-snug" : "text-sm",
          )}
        >
          {feature.description}
        </p>
      </div>
    </li>
  );
}

function FeatureList({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const items = compact ? homeLandingFeatures.slice(0, 4) : homeLandingFeatures;

  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {items.map((feature) => (
        <FeatureRow key={feature.title} feature={feature} compact={compact} />
      ))}
    </ul>
  );
}

function InfoPanelFooter() {
  return (
    <footer
      className={cn(
        "mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs",
        layoutInsetXClass,
        "pb-6",
      )}
    >
      <span>
        © {new Date().getFullYear()} {siteConfig.name}
      </span>
      <Link
        href={siteConfig.links.github}
        className="hover:text-foreground"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </Link>
    </footer>
  );
}

function MarketingInfoPanel() {
  return (
    <aside
      className={cn(
        "hidden min-h-0 flex-col border-s bg-muted/40 lg:flex lg:w-1/2 lg:shrink-0",
      )}
      aria-label="Product overview"
    >
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col justify-center",
          layoutInsetXClass,
          layoutGapClass,
          "py-8",
        )}
      >
        <Badge variant="outline" className="w-fit">
          Environment variables
        </Badge>
        <h1 className={cn(layoutPageTitleClass, "max-w-md text-2xl")}>
          One workspace for project configuration
        </h1>
        <p className="max-w-md text-muted-foreground text-sm">
          Store and manage variables across projects and environments with a
          developer-first dashboard.
        </p>
        <FeatureList className="max-w-md pt-2" />
      </div>
      <InfoPanelFooter />
    </aside>
  );
}

export default function HomeSplitLanding() {
  return (
    <div
      data-testid="marketing-landing"
      className="flex min-h-svh flex-col bg-background lg:h-svh lg:max-h-svh lg:min-h-0 lg:flex-row lg:overflow-hidden"
    >
      <section
        data-testid="marketing-sign-in"
        className={cn(
          "relative flex min-h-0 flex-1 flex-col lg:h-full lg:w-1/2 lg:overflow-hidden",
        )}
      >
        <div className="absolute end-4 top-4 z-10 md:end-6 md:top-6">
          <ModeToggle />
        </div>

        <div className={cn(layoutInsetXClass, "shrink-0 pt-6 pb-2 md:pt-8")}>
          <BrandMark />
        </div>

        <div
          className={cn(
            "flex flex-1 flex-col items-center justify-center pb-6",
            layoutInsetXClass,
          )}
        >
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Sign in to {siteConfig.name}</CardTitle>
              <CardDescription>
                Use GitHub to access your projects and environment variables.
              </CardDescription>
            </CardHeader>
            <CardPanel className="flex flex-col gap-4">
              <GitHubLoginButton
                size="default"
                label="Continue with GitHub"
                className="w-full"
              />
              <p className="text-center text-muted-foreground text-xs leading-relaxed">
                By continuing, you agree to sign in with GitHub for
                authentication only. We store the workspace data you create; see
                our{" "}
                <Link
                  href={siteConfig.links.github}
                  className="underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  repo
                </Link>{" "}
                for source and licensing.
              </p>
            </CardPanel>
          </Card>
        </div>

        <div
          className={cn(
            "shrink-0 border-t bg-muted/20 lg:hidden",
            layoutInsetXClass,
            "py-6",
          )}
        >
          <p className="mb-3 font-medium text-sm">What you get</p>
          <FeatureList compact />
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
            <span>
              © {new Date().getFullYear()} {siteConfig.name}
            </span>
            <Link
              href={siteConfig.links.github}
              className="hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Link>
          </div>
        </div>
      </section>

      <MarketingInfoPanel />
    </div>
  );
}
