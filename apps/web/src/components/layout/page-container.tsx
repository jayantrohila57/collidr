import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Primary page padding and vertical rhythm (shadcn dashboard-01). */
export function PageContainer({
  children,
  className,
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "narrow" | "full";
}) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-1 flex-col gap-4",
        size === "narrow" && "mx-auto max-w-2xl",
        size === "full" && "w-full",
        className,
      )}
    >
      {children}
    </div>
  );
}
