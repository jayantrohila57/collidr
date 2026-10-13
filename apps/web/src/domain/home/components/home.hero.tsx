"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitHubLoginButton } from "@/domain/auth/components/github-login";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { layoutPageTitleClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

export default function Hero() {
  const { data: session, isPending } = useSession();

  return (
    <section
      data-testid="marketing-hero"
      className="flex flex-col gap-4 pt-4 md:pt-8"
    >
      <Badge variant="outline" className="w-fit">
        Environment variables
      </Badge>
      <h1
        className={cn(layoutPageTitleClass, "max-w-3xl text-3xl sm:text-4xl")}
      >
        Ship configuration with confidence
      </h1>
      <p className="max-w-2xl text-muted-foreground text-sm sm:text-base">
        Store and manage environment variables across projects and
        environments—from one developer-first workspace.
      </p>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {isPending ? (
          <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
        ) : session?.user ? (
          <Button render={<Link href="/dashboard" />}>
            Open dashboard
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        ) : (
          <>
            <GitHubLoginButton size="default" />
            <Button variant="outline" render={<Link href="#features" />}>
              See features
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
