"use client";

import type { Route } from "next";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/patterns/empty-state";
import DashboardSection from "@/components/section-dashboard";
import { LayoutGrid } from "@/lib/icons";
import { useProjectApps } from "../hooks/use-project-apps";
import { AppGridSkeleton } from "./project-apps-directory";

/** Renders an app route only when the app is installed on the project. */
export function AppGate({
  slug,
  appId,
  fallback,
  children,
}: {
  slug: string;
  appId: string;
  fallback: ReactNode;
  children: ReactNode;
}) {
  const { apps, isLoading, canManage } = useProjectApps(slug);
  if (isLoading) return <>{fallback}</>;
  const app = apps.find((a) => a.id === appId);
  if (app?.status === "active") return <>{children}</>;
  return (
    <DashboardSection title={app?.name ?? "App"} back={`/p/${slug}` as Route}>
      <EmptyState
        icon={LayoutGrid}
        title={`${app?.name ?? "This app"} isn't installed`}
        description={
          canManage
            ? "Install it from the Apps page to use it in this project."
            : "Ask a project manager to install it on this project."
        }
        actionLabel={canManage ? "Go to Apps" : undefined}
        actionHref={canManage ? `/p/${slug}/apps` : undefined}
      />
    </DashboardSection>
  );
}
