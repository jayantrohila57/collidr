import { AppIcon } from "@/components/patterns/app-icon";
import { Badge } from "@/components/ui/badge";
import type { AppIconName } from "@/lib/icons";
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
  archived: "secondary",
};

const STATUS_ICON: Partial<Record<string, AppIconName>> = {
  active: "statusActive",
  inactive: "statusInactive",
  maintenance: "statusMaintenance",
  building: "statusMaintenance",
  archived: "statusArchived",
  failed: "danger",
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = String(status).toLowerCase();
  const variant = VARIANTS[normalized] ?? "secondary";
  const iconName = STATUS_ICON[normalized];

  return (
    <Badge variant={variant} className={cn("gap-1.5 capitalize", className)}>
      {iconName ? (
        <AppIcon
          name={iconName}
          className={cn(
            normalized === "active" && "fill-current text-emerald-600",
          )}
        />
      ) : null}
      {status}
    </Badge>
  );
}
