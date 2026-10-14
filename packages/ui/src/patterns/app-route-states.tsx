"use client";

import { FileQuestion, ShieldX } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  PageStatusError,
  PageStatusForbidden,
  PageStatusNotFound,
} from "./page-state";

export type AppRouteStateLinks = {
  homeHref: string;
  homeLabel?: string;
  dashboardHref?: string;
};

export function AppNotFoundPage({ links }: { links: AppRouteStateLinks }) {
  return (
    <PageStatusNotFound
      icon={FileQuestion}
      title="Page not found"
      description="This page does not exist or you no longer have access."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" render={<Link href={links.homeHref as Route} />}>
            Go home
          </Button>
          {links.dashboardHref ? (
            <Button
              size="sm"
              variant="outline"
              render={<Link href={links.dashboardHref as Route} />}
            >
              Open dashboard
            </Button>
          ) : null}
        </div>
      }
    />
  );
}

export function AppForbiddenPage({ links }: { links: AppRouteStateLinks }) {
  return (
    <PageStatusForbidden
      icon={ShieldX}
      title="Access denied"
      description="You do not have permission to view this page."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          {links.dashboardHref ? (
            <Button
              size="sm"
              render={<Link href={links.dashboardHref as Route} />}
            >
              Back to dashboard
            </Button>
          ) : null}
          <Button
            size="sm"
            variant={links.dashboardHref ? "outline" : "default"}
            render={<Link href={links.homeHref as Route} />}
          >
            {links.homeLabel ?? "Go home"}
          </Button>
        </div>
      }
    />
  );
}

export function AppRouteErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageStatusError
      title="Something went wrong"
      description="We could not load this page. Please try again."
      onRetry={reset}
    />
  );
}

const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var d=document.documentElement;var s=window.matchMedia("(prefers-color-scheme: dark)").matches;if(t==="dark"||(t!=="light"&&s))d.classList.add("dark");else d.classList.remove("dark");}catch(e){}})();`;

export function AppGlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: theme bootstrap for error boundary
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="flex min-h-svh items-center justify-center bg-background p-6 font-sans text-foreground antialiased">
        <Card>
          <CardHeader>
            <CardTitle>Application error</CardTitle>
            <CardDescription>
              Something went wrong. Please refresh the page or try again.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button type="button" onClick={reset}>
              Try again
            </Button>
          </CardFooter>
        </Card>
      </body>
    </html>
  );
}
