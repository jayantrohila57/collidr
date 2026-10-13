import type { ReactNode } from "react";
import {
  layoutFormStackClass,
  layoutPageTitleClass,
} from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(layoutFormStackClass, className)}>
      <div className="flex flex-col gap-0.5">
        <h2 className={layoutPageTitleClass}>{title}</h2>
        {description ? (
          <p className="text-muted-foreground text-xs">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
