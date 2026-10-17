"use client";

import {
  ActivityHeatmap,
  computeStreaks,
  StatChip,
} from "@loftlancer/ui/patterns/settings-frame";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import { trpc } from "@/utils/trpc";

/** form-5 "Organization Activity": year select, stat chips, 52-week heatmap (real audit_event data). */
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

  const streaks = data ? computeStreaks(data.days) : null;
  return (
    <section className="space-y-3 rounded-xl border bg-card p-4 text-card-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-sm">{title}</h2>
        {data && data.years.length > 0 ? (
          <select
            aria-label="Year"
            className="h-8 rounded-md border bg-background px-2 text-sm"
            value={data.year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {data.years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      {isPending || !data || !streaks ? (
        <Skeleton className="h-28 w-full" />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <StatChip label="events" value={data.total} />
            <StatChip label="active days" value={streaks.activeDays} />
            <StatChip
              label="longest streak (days)"
              value={streaks.longestStreak}
            />
          </div>
          <ActivityHeatmap year={data.year} days={data.days} />
        </>
      )}
    </section>
  );
}
