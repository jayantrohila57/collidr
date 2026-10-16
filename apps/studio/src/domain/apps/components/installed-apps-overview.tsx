"use client";

import type { Route } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/patterns/empty-state";
import { Button } from "@/components/ui/button";
import { LayoutGrid } from "@/lib/icons";
import { useProjectApps } from "../hooks/use-project-apps";
import { AppGlyph } from "./app-glyph";
import { AppGridSkeleton } from "./project-apps-directory";

/** Project overview body: the project's installed apps. */
export function InstalledAppsOverview({
  slug,
  summaries,
}: {
  slug: string;
  summaries?: Record<string, string>;
}) {
  const { installed, isLoading, isError, canManage } = useProjectApps(slug);
  if (isLoading) return <AppGridSkeleton count={1} />;

  if (!isError && installed.length === 0) {
    return (
      <EmptyState
        icon={LayoutGrid}
        title="No apps installed"
        description={
          canManage
            ? "Install Environments, Tasks and more to start working in this project."
            : "A project manager hasn't installed any apps on this project yet."
        }
        actionLabel={canManage ? "Browse apps" : undefined}
        actionHref={canManage ? `/p/${slug}/apps` : undefined}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-8 items-center justify-between">
        <h2 className="font-medium text-sm">Apps</h2>
        <Button
          size="sm"
          variant="ghost"
          render={<Link href={`/p/${slug}/apps` as Route} />}
        >
          {canManage ? "Manage apps" : "All apps"}
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {installed.map((app) => (
          <Link
            key={app.id}
            href={`/p/${slug}/${app.nav[0]?.path ?? app.id}` as Route}
            className="flex min-h-28 flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-border/60 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center gap-3">
              <AppGlyph icon={app.icon} />
              <h3 className="truncate font-medium text-sm">{app.name}</h3>
            </div>
            <p className="line-clamp-2 flex-1 text-muted-foreground text-xs">
              {app.description}
            </p>
            <p className="text-muted-foreground text-xs tabular-nums">
              {summaries?.[app.id] ?? "\u00a0"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
