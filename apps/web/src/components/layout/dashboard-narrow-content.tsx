import type { ReactNode } from "react";
import { layoutInsetContainerNarrowClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

/** Narrow column inside the wide (`max-w-6xl`) dashboard inset. */
export function DashboardNarrowContent({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(layoutInsetContainerNarrowClass, className)}>
      {children}
    </div>
  );
}
