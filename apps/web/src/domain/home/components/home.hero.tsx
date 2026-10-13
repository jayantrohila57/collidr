"use client";

import { ArrowRight, CheckCircle, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GitHubLoginButton } from "@/domain/auth/components/github-login";
import { useSession } from "@/domain/auth/lib/auth-actions";

export default function Hero() {
  const { data: session, isPending } = useSession();

  return (
    <div
      data-testid="marketing-hero"
      className="flex flex-col items-start justify-start space-y-4 py-16 md:items-start md:text-left"
    >
      <div className="space-y-6">
        <Badge variant="secondary">
          <Zap className="mr-2 h-3 w-3" />
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
          <Button size="lg" className="w-80 gap-2" asChild>
            <Link href="/dashboard">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <GitHubLoginButton />
        )}
      </div>

      <div className="grid w-full grid-cols-1 gap-6 pt-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-left">
            <div className="mb-2 flex justify-start">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold">Secure Storage</h3>
            <p className="text-muted-foreground text-sm">
              Bank-level encryption for your secrets
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-left">
            <div className="mb-2 flex justify-start">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold">CI/CD Integration</h3>
            <p className="text-muted-foreground text-sm">
              Seamless deployment workflows
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-left">
            <div className="mb-2 flex justify-start">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold">Multi-Environment</h3>
            <p className="text-muted-foreground text-sm">
              Dev, staging, and production support
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
