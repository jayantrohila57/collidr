"use client";

import { useHydrated } from "@loftlancer/ui/hooks/use-hydrated";
import { cn } from "@loftlancer/ui/utils";
import { formatDate, LOCAL_DATE_FORMAT } from "@/lib/format";

/**
 * Absolute calendar dates in account settings, using the shared formatDate
 * helper with the same hydration placeholder pattern as LocalDateTime (#73).
 */
export function ClientFormattedDate({
  value,
  className,
}: {
  value: Date | string | number;
  className?: string;
}) {
  const hydrated = useHydrated();
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return <span className={className}>—</span>;
  }
  const text = formatDate(
    date,
    hydrated ? LOCAL_DATE_FORMAT : { ...LOCAL_DATE_FORMAT, timeZone: "UTC" },
  );
  return (
    <time
      dateTime={date.toISOString()}
      className={cn("tabular-nums", !hydrated && "invisible", className)}
    >
      {text}
    </time>
  );
}
