"use client";

import { useHydrated } from "../hooks/use-hydrated";
import { cn } from "../lib/utils";

export const LOCAL_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

export const LOCAL_DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  ...LOCAL_DATE_FORMAT,
  hour: "numeric",
  minute: "2-digit",
};

function toDate(value: Date | string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * An absolute date/time in the viewer's timezone with no hydration flicker
 * (#327). The server has no idea of the viewer's zone, so the server HTML and
 * the hydration pass render the same UTC text *invisibly* (reserving the
 * width); right after hydration the local value is painted in the same box.
 * Client-side navigations render the local value immediately.
 */
export function LocalDateTime({
  value,
  options = LOCAL_DATE_FORMAT,
  className,
  fallback = "—",
}: {
  value: Date | string | number | null | undefined;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
  fallback?: string;
}) {
  const hydrated = useHydrated();
  const date = toDate(value);
  if (!date) return <span className={className}>{fallback}</span>;
  const text = new Intl.DateTimeFormat(
    "en-US",
    hydrated ? options : { ...options, timeZone: "UTC" },
  ).format(date);
  return (
    <time
      dateTime={date.toISOString()}
      className={cn("tabular-nums", !hydrated && "invisible", className)}
    >
      {text}
    </time>
  );
}
