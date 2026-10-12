"use client";

import { cn } from "@/lib/utils";

interface SecretValueProps {
  revealed: boolean;
  value?: string;
  className?: string;
}

export function SecretValue({ revealed, value, className }: SecretValueProps) {
  return (
    <span
      className={cn(
        "block min-h-[1.25rem] break-all font-mono text-muted-foreground text-sm",
        className,
      )}
      aria-hidden={!revealed}
    >
      {revealed ? (value ?? "—") : "••••••••"}
    </span>
  );
}
