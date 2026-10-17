"use client";

import { Badge } from "@loftlancer/ui/badge";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { cn } from "@/lib/utils";

/** Fixed footprint so tabs do not shift while counts load. */
const countSlotClassName =
  "inline-flex h-5 min-w-7 shrink-0 items-center justify-center px-1 tabular-nums sm:h-4 sm:min-w-6";

export function EnvironmentTabCountBadge({ count }: { count?: number }) {
  if (count === undefined) {
    return (
      <Skeleton
        className={cn(countSlotClassName, "rounded-[.25rem]")}
        aria-hidden
      />
    );
  }

  return (
    <Badge
      variant="secondary"
      size="sm"
      className={cn(countSlotClassName, "justify-center")}
    >
      {count}
    </Badge>
  );
}
