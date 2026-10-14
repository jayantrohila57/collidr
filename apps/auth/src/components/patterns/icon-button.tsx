"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
  isLoading?: boolean;
}

export function IconButton({
  icon: Icon,
  label,
  className,
  iconClassName,
  isLoading = false,
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <TooltipProvider delay={300}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("size-11 shrink-0", className)}
              aria-label={label}
              disabled={disabled || isLoading}
              {...props}
            />
          }
        >
          {isLoading ? (
            <Spinner className="size-4" aria-hidden />
          ) : (
            <Icon className={cn("size-4", iconClassName)} aria-hidden />
          )}
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
