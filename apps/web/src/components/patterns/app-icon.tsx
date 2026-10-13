import type { AppIconName } from "@/lib/icons";
import { appIcons, iconMutedClassName } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function AppIcon({
  name,
  className,
}: {
  name: AppIconName;
  className?: string;
}) {
  const Icon = appIcons[name];
  return <Icon className={cn(iconMutedClassName, className)} aria-hidden />;
}
