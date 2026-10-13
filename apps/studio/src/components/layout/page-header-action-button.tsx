"use client";

import type { ReactNode } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { AppIconName } from "@/lib/icons";
import { cn } from "@/lib/utils";

/** Primary page-header actions: icon-only below `sm`, label visible from `sm` up. */
export const pageHeaderActionCompactClassName =
  "gap-2 max-sm:size-8 max-sm:shrink-0 max-sm:gap-0 max-sm:px-0";

export const pageHeaderActionLabelClassName = "sr-only sm:not-sr-only";

export function pageHeaderActionButtonClassName(
  className?: string,
  compactOnMobile = true,
) {
  return cn(
    compactOnMobile ? pageHeaderActionCompactClassName : "gap-2",
    className,
  );
}

export function PageHeaderActionLabel({ children }: { children: ReactNode }) {
  return <span className={pageHeaderActionLabelClassName}>{children}</span>;
}

type PageHeaderActionButtonProps = Omit<ButtonProps, "children"> & {
  /** Visible label; hidden visually below `sm` when `compactOnMobile` is true. */
  label: string;
  icon?: AppIconName;
  iconNode?: ReactNode;
  compactOnMobile?: boolean;
};

export function PageHeaderActionButton({
  label,
  icon = "plus",
  iconNode,
  compactOnMobile = true,
  className,
  size = "sm",
  ...props
}: PageHeaderActionButtonProps) {
  return (
    <Button
      type="button"
      size={size}
      className={pageHeaderActionButtonClassName(className, compactOnMobile)}
      {...props}
    >
      {iconNode ?? <AppIcon name={icon} className="text-current" />}
      {compactOnMobile ? (
        <PageHeaderActionLabel>{label}</PageHeaderActionLabel>
      ) : (
        label
      )}
    </Button>
  );
}
