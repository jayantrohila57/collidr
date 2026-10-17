import { cn } from "./utils";

export type PageHeaderGridSlots = {
  hasBack: boolean;
  hasAction: boolean;
};

/** Grid placement for description headers — avoid md:col-start-2 without a back column. */
export function pageHeaderDescriptionGridTitleClass(hasBack: boolean) {
  return cn("[grid-area:title]", hasBack && "md:col-start-2");
}

export function pageHeaderDescriptionGridDescClass(hasBack: boolean) {
  return cn("[grid-area:desc]", hasBack && "md:col-start-2");
}

export function pageHeaderDescriptionGridActionClass(hasBack: boolean) {
  return cn(
    "shrink-0 self-center [grid-area:action]",
    hasBack && "md:col-start-3",
  );
}

function pageHeaderDescriptionMobileCols({
  hasBack,
  hasAction,
}: PageHeaderGridSlots) {
  if (hasBack) {
    return hasAction
      ? "grid-cols-[auto_minmax(0,1fr)_auto]"
      : "grid-cols-[auto_minmax(0,1fr)]";
  }
  return hasAction ? "grid-cols-[minmax(0,1fr)_auto]" : "grid-cols-1";
}

function pageHeaderDescriptionMobileAreas({
  hasBack,
  hasAction,
}: PageHeaderGridSlots) {
  if (hasBack) {
    return hasAction
      ? "[grid-template-areas:'leading_title_action'_'desc_desc_desc']"
      : "[grid-template-areas:'leading_title'_'desc_desc_desc']";
  }
  return hasAction
    ? "[grid-template-areas:'title_action'_'desc_desc']"
    : "[grid-template-areas:'title'_'desc']";
}

function pageHeaderDescriptionDesktopCols({ hasBack }: PageHeaderGridSlots) {
  if (hasBack) {
    return "md:grid-cols-[auto_minmax(0,1fr)_auto]";
  }
  return "md:grid-cols-[minmax(0,1fr)_auto]";
}

function pageHeaderDescriptionDesktopAreas({ hasBack }: PageHeaderGridSlots) {
  if (hasBack) {
    return "md:[grid-template-areas:'leading_title_action'_'leading_desc_desc']";
  }
  return "md:[grid-template-areas:'title_action'_'desc_desc']";
}

/** Shell classes for {@link PageHeaderTopWithDescriptionGrid}. */
export function pageHeaderTopDescriptionGridShellClass(
  slots: PageHeaderGridSlots,
) {
  return cn(
    "grid w-full min-w-0 py-0.5",
    pageHeaderDescriptionMobileCols(slots),
    pageHeaderDescriptionMobileAreas(slots),
    pageHeaderDescriptionDesktopCols(slots),
    pageHeaderDescriptionDesktopAreas(slots),
    "min-h-12",
  );
}

function pageHeaderMetadataMobileCols({
  hasBack,
  hasAction,
}: PageHeaderGridSlots) {
  if (hasBack) {
    return hasAction
      ? "grid-cols-[auto_minmax(0,1fr)_auto]"
      : "grid-cols-[auto_minmax(0,1fr)]";
  }
  return hasAction ? "grid-cols-[minmax(0,1fr)_auto]" : "grid-cols-1";
}

function pageHeaderMetadataMobileAreas({
  hasBack,
  hasAction,
}: PageHeaderGridSlots) {
  if (hasBack) {
    return hasAction
      ? "[grid-template-areas:'leading_title_action'_'div_div_div'_'meta_meta_meta']"
      : "[grid-template-areas:'leading_title'_'div_div'_'meta_meta']";
  }
  return hasAction
    ? "[grid-template-areas:'title_action'_'div_div'_'meta_meta']"
    : "[grid-template-areas:'title'_'div'_'meta']";
}

function pageHeaderMetadataDesktopCols({ hasBack }: PageHeaderGridSlots) {
  if (hasBack) {
    return "md:grid-cols-[auto_auto_minmax(0,1fr)_auto_auto_auto]";
  }
  return "md:grid-cols-[minmax(0,1fr)_auto_auto_auto]";
}

function pageHeaderMetadataDesktopAreas({ hasBack }: PageHeaderGridSlots) {
  if (hasBack) {
    return "md:[grid-template-areas:'leading_leading-sep_title_meta-sep_meta_action']";
  }
  return "md:[grid-template-areas:'title_meta-sep_meta_action']";
}

/** Shell classes for {@link PageHeaderWithMetadataGrid}. */
export function pageHeaderWithMetadataGridShellClass(
  slots: PageHeaderGridSlots,
  hasDescription: boolean,
) {
  return cn(
    "grid w-full min-w-0 py-0.5",
    pageHeaderMetadataMobileCols(slots),
    pageHeaderMetadataMobileAreas(slots),
    pageHeaderMetadataDesktopCols(slots),
    pageHeaderMetadataDesktopAreas(slots),
    hasDescription ? "md:items-start" : "md:items-center",
  );
}

export function pageHeaderMetadataGridActionWrapClass(hasDescription: boolean) {
  return cn(
    "shrink-0 [grid-area:action]",
    hasDescription ? "md:mt-1 md:self-start" : "md:self-center",
  );
}

export function pageHeaderDescriptionGridActionWrapClass(
  slots: PageHeaderGridSlots,
) {
  return cn(
    pageHeaderDescriptionGridActionClass(slots.hasBack),
    !slots.hasAction && "max-md:hidden",
  );
}
