import { cn } from "@/lib/utils";

/** Shared metadata block for page header (mobile 2-col grid, desktop stacked column). */
export const pageHeaderMetadataClassName = cn(
  "min-w-0 text-xs",
  "grid w-full grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 sm:gap-x-4",
  "md:flex md:w-auto md:max-w-[14rem] md:flex-col md:gap-0.5",
);

export const pageHeaderMetadataFieldClassName =
  "col-span-2 grid grid-cols-subgrid items-center md:flex md:w-full md:justify-between md:gap-3";

export const pageHeaderMetadataLabelClassName =
  "shrink-0 text-muted-foreground";

export const pageHeaderMetadataValueClassName =
  "min-w-0 truncate text-end md:max-w-[9rem]";
