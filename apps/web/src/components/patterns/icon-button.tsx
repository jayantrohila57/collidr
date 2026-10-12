"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface IconButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "children"> {
  icon: LucideIcon;
  label: string;
  iconClassName?: string;
}

export function IconButton({
  icon: Icon,
  label,
  className,
  iconClassName,
  ...props
}: IconButtonProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("size-11 shrink-0", className)}
            aria-label={label}
            {...props}
          >
            <Icon className={cn("size-4", iconClassName)} aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
