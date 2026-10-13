"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { buttonVariants } from "../components/ui/button";
import { marketingContainerClass } from "../lib/layout-spacing";
import { docsSiteUrl } from "../lib/platform-urls";
import { cn } from "../lib/utils";
import { marketingSiteConfig } from "./site-config";

export type MarketingNavItem = {
  label: string;
  href: string;
  external?: boolean;
};

const primaryNav: MarketingNavItem[] = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: docsSiteUrl(), external: true },
  { label: "About", href: "/about" },
];

const footerNav: MarketingNavItem[] = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Changelog", href: "/changelog" },
  { label: "Docs", href: docsSiteUrl(), external: true },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "GitHub", href: marketingSiteConfig.links.github, external: true },
];

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

function NavLink({ item }: { item: MarketingNavItem }) {
  const className =
    "text-sm text-muted-foreground transition-colors hover:text-foreground";
  if (item.external) {
    return (
      <a
        href={item.href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {item.label}
      </a>
    );
  }
  return (
    <Link href={item.href as "/"} className={className}>
      {item.label}
    </Link>
  );
}

export type MarketingSiteHeaderProps = {
  signInHref: string;
  headerActions?: ReactNode;
};

export function MarketingSiteHeader({
  signInHref,
  headerActions,
}: MarketingSiteHeaderProps) {
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
          <div className="hidden items-center gap-4 md:flex">
            {primaryNav.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
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

export function MarketingSiteFooter() {
  return (
    <footer className="border-t">
      <div className={cn(marketingContainerClass, "py-10")}>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground text-sm">
          {footerNav.map((item) => (
            <span key={item.href}>
              <NavLink item={item} />
            </span>
          ))}
        </div>
        <p className="mt-6 text-muted-foreground text-sm">
          © {new Date().getFullYear()} {marketingSiteConfig.name}
        </p>
      </div>
    </footer>
  );
}

export type MarketingPageShellProps = {
  signInHref: string;
  headerActions?: ReactNode;
  children: ReactNode;
};

/** Standard marketing chrome for inner pages on `apps/www`. */
export function MarketingPageShell({
  signInHref,
  headerActions,
  children,
}: MarketingPageShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <MarketingSiteHeader
        signInHref={signInHref}
        headerActions={headerActions}
      />
      <main className="flex-1">{children}</main>
      <MarketingSiteFooter />
    </div>
  );
}

export { MarketingLinkButton };
