import type { ReactNode } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { SheetTitle } from "@/components/ui/sheet";
import type { AppIconName } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function SheetTitleWithIcon({
  icon,
  children,
  className,
}: {
  icon: AppIconName;
  children: ReactNode;
  className?: string;
}) {
  return (
    <SheetTitle className={cn("flex items-center gap-2", className)}>
      <AppIcon name={icon} />
      <span>{children}</span>
    </SheetTitle>
  );
}
