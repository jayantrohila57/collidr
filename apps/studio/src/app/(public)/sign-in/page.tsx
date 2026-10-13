import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { GitHubLoginButton } from "@/domain/auth/components/github-login";
import { layoutInsetXClass } from "@/lib/layout-spacing";
import { siteConfig } from "@/lib/siteConfig";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Sign in · ${siteConfig.name}`,
};

export default function SignInPage() {
  return (
    <div
      data-testid="sign-in-page"
      className="relative flex min-h-svh flex-col bg-background"
    >
      <div className="absolute end-4 top-4 z-10 md:end-6 md:top-6">
        <ModeToggle />
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col items-center justify-center",
          layoutInsetXClass,
          "px-4 py-12",
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
            <Suspense fallback={null}>
              <GitHubLoginButton
                size="default"
                label="Continue with GitHub"
                className="w-full"
              />
            </Suspense>
            <p className="text-center text-muted-foreground text-xs leading-relaxed">
              <Link href="/" className="underline-offset-4 hover:underline">
                Back to home
              </Link>
            </p>
          </CardPanel>
        </Card>
      </div>
    </div>
  );
}
