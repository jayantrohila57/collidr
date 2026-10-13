"use client";

import { ArrowRight, CheckCircle, Shield, Zap } from "lucide-react";
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
import { GitHubLoginButton } from "@/domain/auth/components/github-login";
import { useSession } from "@/domain/auth/lib/auth-actions";

export default function Hero() {
  const { data: session, isPending } = useSession();

  return (
    <div
      data-testid="marketing-hero"
      className="flex flex-col items-start justify-start space-y-4 py-16 md:items-start md:text-start"
    >
      <div className="space-y-6">
        <Badge variant="secondary">
          <Zap className="me-2 h-3 w-3" />
          Developer-First Environment Management
        </Badge>
        <h1 className="font-bold text-5xl tracking-tight sm:text-6xl lg:text-7xl">
          Manage Environment
          <span className="block text-primary">Variables with Confidence</span>
        </h1>
        <p className="text-base text-muted-foreground sm:text-xl md:max-w-xl">
          Securely store, manage, and deploy environment variables across all
          your projects from a single, reliable dashboard.
        </p>
      </div>

      <div className="items-left flex flex-col gap-4 pt-4 sm:flex-row md:items-start">
        {isPending ? (
          <div className="h-11 w-32 animate-pulse rounded-lg bg-muted" />
        ) : session?.user ? (
          <Button
            size="lg"
            className="w-80 gap-2"
            render={<Link href="/dashboard" />}
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <GitHubLoginButton />
        )}
      </div>

      <div className="grid w-full grid-cols-1 gap-6 pt-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Secure Storage</CardTitle>
            <CardDescription>
              Bank-level encryption for your secrets
            </CardDescription>
          </CardHeader>
          <CardPanel>
            <Shield className="size-8 text-primary" aria-hidden />
          </CardPanel>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>CI/CD Integration</CardTitle>
            <CardDescription>Seamless deployment workflows</CardDescription>
          </CardHeader>
          <CardPanel>
            <Zap className="size-8 text-primary" aria-hidden />
          </CardPanel>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Multi-Environment</CardTitle>
            <CardDescription>
              Dev, staging, and production support
            </CardDescription>
          </CardHeader>
          <CardPanel>
            <CheckCircle className="size-8 text-primary" aria-hidden />
          </CardPanel>
        </Card>
      </div>
    </div>
  );
}
