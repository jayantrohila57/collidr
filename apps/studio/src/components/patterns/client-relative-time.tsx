"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";
import { formatRelativeShort } from "@/lib/format-relative-short";

/** Avoid SSR/client mismatch from `Date.now()` in relative formatting. */
export function ClientRelativeTime({
  value,
  fallbackFormat = { month: "short", day: "numeric", year: "numeric" },
}: {
  value: Date | string | number;
  fallbackFormat?: Intl.DateTimeFormatOptions;
}) {
  const stable = formatDate(value, fallbackFormat);
  const [label, setLabel] = useState(stable);

  useEffect(() => {
    setLabel(formatRelativeShort(value));
  }, [value]);

  return <span>{label}</span>;
}
