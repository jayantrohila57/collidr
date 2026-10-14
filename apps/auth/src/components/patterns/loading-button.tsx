"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingLabel?: string;
}

export function LoadingButton({
  loading = false,
  loadingLabel,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  const label = loading && loadingLabel ? loadingLabel : children;

  return (
    <Button
      loading={loading}
      disabled={disabled || loading}
      className={cn(loadingLabel && "min-w-28", className)}
      {...props}
    >
      {label}
    </Button>
  );
}
