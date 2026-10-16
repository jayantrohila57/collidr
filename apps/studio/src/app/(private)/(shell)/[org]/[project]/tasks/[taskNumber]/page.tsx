import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

export default async function ProjectTaskRoute({
  params,
}: {
  params: Promise<{ org: string; project: string; taskNumber: string }>;
}) {
  const { project: slug, taskNumber } = await params;
  if (!/^[1-9]\d*$/.test(taskNumber)) notFound();
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
