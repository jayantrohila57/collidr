import { AppIcon } from "@/components/patterns/app-icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function VisibilityBadge({
  isPublic,
  className,
}: {
  isPublic: boolean;
  className?: string;
}) {
  return (
    <Badge
      variant={isPublic ? "outline" : "secondary"}
      className={cn("gap-1.5 capitalize", className)}
    >
      <AppIcon name={isPublic ? "globe" : "lock"} />
      {isPublic ? "Public" : "Private"}
    </Badge>
  );
}
