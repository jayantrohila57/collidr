import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Primary table column: leading avatar/icon + stacked text (`gap-2`). */
export function TableLeadingCell({
  leading,
  children,
  className,
}: {
  leading: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-start gap-2", className)}>
      <div className="flex shrink-0 items-center pt-0.5">{leading}</div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
