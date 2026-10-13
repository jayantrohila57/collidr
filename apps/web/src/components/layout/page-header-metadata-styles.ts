import { cn } from "@/lib/utils";

/** Shared metadata block for page header (compact column beside title). */
export const pageHeaderMetadataClassName = cn(
  "flex min-w-0 flex-col gap-1 text-xs",
  "md:w-auto md:max-w-[14rem]",
);

export const pageHeaderMetadataFieldClassName =
  "flex min-w-0 items-baseline justify-between gap-2";

export const pageHeaderMetadataLabelClassName =
  "shrink-0 text-muted-foreground";

export const pageHeaderMetadataValueClassName =
  "min-w-0 truncate text-end tabular-nums";

export const pageHeaderMetadataLinksRowClassName =
  "flex min-w-0 flex-wrap items-center justify-end gap-0.5 md:justify-start";
