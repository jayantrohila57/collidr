"use client";

import { Skeleton } from "../components/ui/skeleton";
import {
  ActivityHeatmap,
  computeStreaks,
  type HeatmapDay,
  StatChip,
} from "./settings-frame";

export type ActivityOverviewData = {
  year: number;
  years: number[];
  total: number;
  days: HeatmapDay[];
};

/**
 * form-5 "Activity" card: year select, stat chips, 52-week heatmap.
 * Presentational only; each app fetches its own audit heatmap data.
 * The skeleton keeps the card height while loading (zero layout shift).
 */
export function ActivityOverviewPanel({
  title = "Activity",
  data,
  isPending,
  onYearChange,
}: {
  title?: string;
  data: ActivityOverviewData | undefined;
  isPending: boolean;
  onYearChange: (year: number) => void;
}) {
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
            onChange={(e) => onYearChange(Number(e.target.value))}
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
