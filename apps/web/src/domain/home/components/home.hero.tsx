"use client";

import { ArrowRight, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { FramePanel } from "@/components/ui/frame";
import { GitHubLoginButton } from "@/domain/auth/components/github-login";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { layoutGapClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

const highlights = [
  {
    icon: Shield,
    title: "Encrypted secrets",
    description: "Variables encrypted at rest with audit-friendly access.",
  },
  {
    icon: Zap,
    title: "Per environment",
    description: "Dev, staging, and production in one workspace.",
  },
];

export default function Hero() {
  const { data: session, isPending } = useSession();

  return (
    <>
      <FramePanel data-testid="marketing-hero" className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          Environment management
        </Badge>
        <h1 className="max-w-2xl font-semibold text-3xl tracking-tight sm:text-4xl">
          Ship configuration with confidence
        </h1>
        <p className="max-w-xl text-muted-foreground text-sm sm:text-base">
          Store and manage environment variables across projects and
          environments—from a dense, developer-first dashboard.
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {isPending ? (
            <div className="h-8 w-36 animate-pulse rounded-md bg-muted" />
          ) : session?.user ? (
            <Button size="sm" render={<Link href="/dashboard" />}>
              Open dashboard
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <GitHubLoginButton size="default" />
          )}
        </div>
      </FramePanel>
      <FramePanel
        className={cn("grid sm:grid-cols-2", layoutGapClass)}
        aria-hidden={false}
      >
        {highlights.map((item) => (
          <Card key={item.title} className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardPanel className="pt-0">
              <item.icon className="size-5 text-muted-foreground" aria-hidden />
            </CardPanel>
          </Card>
        ))}
      </FramePanel>
    </>
  );
}
