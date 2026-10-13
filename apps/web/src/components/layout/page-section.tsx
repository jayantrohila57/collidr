import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Scrollable bordered content area below a page header. */
export function PageSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <CardContent className={cn("min-w-0 p-4 md:p-6", className)}>
        {children}
      </CardContent>
    </Card>
  );
}
