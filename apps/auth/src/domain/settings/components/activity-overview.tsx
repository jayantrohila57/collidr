"use client";

import { ActivityOverviewPanel } from "@loftlancer/ui/patterns/activity-overview";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import { trpc } from "@/utils/trpc";

/** User activity card: fetches the audit heatmap and renders the shared panel. */
export function ActivityOverview({
  scope,
  title = "Activity",
}: {
  scope: "self" | "org";
  title?: string;
}) {
  const enabled = isActionsAuditEnabledOnClient();
  const [year, setYear] = useState<number | undefined>(undefined);
  const { data, isPending, isError } = useQuery({
    ...trpc.auditEvents.heatmap.queryOptions({
      scope,
      year,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
    enabled,
  });
  if (!enabled || isError) return null;

  return (
    <ActivityOverviewPanel
      title={title}
      data={data}
      isPending={isPending}
      onYearChange={setYear}
    />
  );
}
