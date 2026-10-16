import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AppGate } from "@/domain/apps/components/app-gate";
import {
  TasksPage,
  TasksPageSkeleton,
} from "@/domain/tasks/components/tasks-page";
import { loadProjectPageDataOrNotFound } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Tasks",
  description: "Project tasks.",
};

export default async function ProjectTasksRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadProjectPageDataOrNotFound(slug);
  return (
    <HydrationBoundary state={data.dehydratedState}>
      <Suspense fallback={<TasksPageSkeleton />}>
        <AppGate slug={slug} appId="tasks" fallback={<TasksPageSkeleton />}>
          <TasksPage slug={slug} />
        </AppGate>
      </Suspense>
    </HydrationBoundary>
  );
}
