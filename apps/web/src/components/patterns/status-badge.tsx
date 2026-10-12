import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProjectStatus = "active" | "inactive" | "maintenance";
type EnvironmentStatus = "active" | "inactive" | "building" | "failed";

type Status = ProjectStatus | EnvironmentStatus | string;

const VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  active: "default",
  inactive: "secondary",
  maintenance: "outline",
  building: "outline",
  failed: "destructive",
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = VARIANTS[status] ?? "secondary";
  return (
    <Badge variant={variant} className={cn("capitalize", className)}>
      {status}
    </Badge>
  );
}
