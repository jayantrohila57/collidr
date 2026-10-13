import { layoutSectionStackClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

export function ConsolePageHeader({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-3",
        layoutSectionStackClass,
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="font-semibold text-xl">{title}</h1>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
