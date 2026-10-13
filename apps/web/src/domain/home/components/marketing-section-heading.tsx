import { Badge } from "@/components/ui/badge";
import { layoutPageTitleClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

export function MarketingSectionHeading({
  badge,
  title,
  description,
  className,
}: {
  badge?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex max-w-2xl flex-col gap-2", className)}>
      {badge ? (
        <Badge variant="outline" className="w-fit">
          {badge}
        </Badge>
      ) : null}
      <h2 className={layoutPageTitleClass}>{title}</h2>
      {description ? (
        <p className="text-muted-foreground text-sm">{description}</p>
      ) : null}
    </div>
  );
}
