/**
 * Single size/spacing scale for every in-app page header (studio PageHeader,
 * auth + org SettingsFrame). Header and skeleton share these so loading never
 * shifts layout.
 */
export const pageHeaderRootClass = "flex w-full min-w-0 flex-col gap-2";
export const pageHeaderTopRowClass =
  "flex min-h-12 w-full min-w-0 items-start gap-3";
export const pageHeaderBackClass = "size-8 shrink-0";
export const pageHeaderTitleRowClass =
  "flex min-h-8 min-w-0 flex-wrap items-center gap-2";
export const pageHeaderTitleClass =
  "truncate font-semibold text-lg leading-tight tracking-tight sm:text-xl";
export const pageHeaderDescriptionClass =
  "min-w-0 max-w-[65ch] text-muted-foreground text-xs leading-4";
export const pageHeaderActionsClass =
  "flex h-8 shrink-0 items-center justify-end gap-2";
/** Fixed height even when empty; indented to line up with the title. */
export const pageHeaderMetaRowClass =
  "flex h-6 min-w-0 items-center gap-2 overflow-hidden ps-11 text-muted-foreground text-xs";
export const pageHeaderTabsRowClass =
  "flex h-9 w-full min-w-0 items-end justify-between gap-2 border-b";
export const pageHeaderTabsListClass =
  "-mb-px flex min-w-0 items-end gap-1 overflow-x-auto";
export const pageHeaderTabClass =
  "inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 px-2.5 font-medium text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4";
export const pageHeaderTabActiveClass = "border-foreground text-foreground";
export const pageHeaderTabInactiveClass =
  "border-transparent text-muted-foreground hover:text-foreground";
export const pageHeaderTabsEndClass =
  "flex h-9 shrink-0 items-center gap-2 pb-0.5";
