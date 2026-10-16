import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { AppSettingsPage } from "@/domain/apps/components/app-settings-page";
import { loadProjectPageDataOrNotFound } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "App settings",
  description: "Configure a project app.",
};

export default async function ProjectAppSettingsRoute({
  params,
}: {
  params: Promise<{ slug: string; app: string }>;
}) {
  const { slug, app } = await params;
  const data = await loadProjectPageDataOrNotFound(slug);
  return (
    <HydrationBoundary state={data.dehydratedState}>
      <AppSettingsPage slug={slug} appId={app} />
    </HydrationBoundary>
  );
}
