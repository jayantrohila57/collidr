import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SettingsPanel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "divide-y rounded-xl border bg-card text-card-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SettingsSectionHeader({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("border-b px-4 py-3", className)}>
      <h3 className="font-medium text-sm">{title}</h3>
      {description ? (
        <p className="mt-0.5 text-muted-foreground text-xs">{description}</p>
      ) : null}
    </div>
  );
}

export function SettingsRow({
  label,
  description,
  className,
  children,
}: {
  label: string;
  description?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="font-medium text-sm">{label}</p>
        {description ? (
          <p className="mt-0.5 text-muted-foreground text-xs">{description}</p>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-wrap items-center justify-start gap-2 sm:justify-end">
        {children}
      </div>
    </div>
  );
}

/** Label on the left, constrained field control on the right (settings forms). */
export function SettingsField({
  label,
  description,
  className,
  controlClassName,
  children,
}: {
  label: string;
  description?: string;
  className?: string;
  controlClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,16rem)] sm:items-start sm:gap-8",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="font-medium text-sm">{label}</p>
        {description ? (
          <p className="mt-0.5 text-muted-foreground text-xs">{description}</p>
        ) : null}
      </div>
      <div className={cn("min-w-0 sm:justify-self-end", controlClassName)}>
        {children}
      </div>
    </div>
  );
}

export const settingsControlWidthClass = "w-full max-w-sm";
