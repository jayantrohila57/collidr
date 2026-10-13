import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Plain content region below the page header (no card wrapper). */
export function PageSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-0 min-w-0 flex-1", className)}>{children}</div>
  );
}
