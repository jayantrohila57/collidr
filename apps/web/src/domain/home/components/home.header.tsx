"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { GitHubLoginButton } from "@/domain/auth/components/github-login";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { layoutChromeRowClass } from "@/lib/layout-spacing";
import { siteConfig } from "@/lib/siteConfig";
import { cn } from "@/lib/utils";

export default function Header() {
  const { data: session, isPending } = useSession();

  return (
    <div className={cn(layoutChromeRowClass, "h-10 md:h-12")}>
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
        <span className="truncate font-semibold text-sm">
          {siteConfig.name}
        </span>
      </Link>
      <div className="flex shrink-0 items-center gap-2">
        <ModeToggle />
        {isPending ? (
          <div
            className="size-8 animate-pulse rounded-md bg-muted"
            aria-hidden
          />
        ) : session?.user ? (
          <Button size="sm" render={<Link href="/dashboard" />}>
            Dashboard
          </Button>
        ) : (
          <GitHubLoginButton size="sm" label="Sign in" />
        )}
      </div>
    </div>
  );
}
