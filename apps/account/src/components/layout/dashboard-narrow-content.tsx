import type { ReactNode } from "react";
import { layoutInsetContainerNarrowClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

/** Full-width column inside the dashboard inset (legacy name). */
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
