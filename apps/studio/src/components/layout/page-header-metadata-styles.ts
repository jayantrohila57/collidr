import { cn } from "@/lib/utils";

/** Shared key/value list rendered inside the page header meta row (horizontal, wraps). */
export const pageHeaderMetadataClassName = cn(
  "flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs",
);

export const pageHeaderMetadataFieldClassName =
  "flex min-w-0 items-center gap-1.5";

export const pageHeaderMetadataLabelClassName =
  "shrink-0 text-muted-foreground";

export const pageHeaderMetadataValueClassName =
  "min-w-0 max-w-[16rem] truncate";
