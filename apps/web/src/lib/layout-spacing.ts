/**
 * Layout spacing scale — mirrored from `components/ui/sidebar.tsx` (coss Sidebar).
 *
 * | Sidebar region | Classes |
 * |----------------|---------|
 * | SidebarHeader, SidebarFooter, SidebarGroup | `p-2` |
 * | SidebarContent column | `gap-2` |
 * | SidebarMenu | `gap-1` |
 * | SidebarMenuButton (default) | `h-8`, `gap-2`, `p-2` |
 * | SidebarMenuButton `size="lg"` (team switcher) | `h-12` |
 * | SidebarGroupLabel | `h-8`, `px-2`, `text-xs` |
 */

/** Inset padding (gutter) — SidebarHeader / SidebarGroup */
export const layoutGutterClass = "p-2";

/** Dashboard inset horizontal padding — aligns header and scrollable main */
export const layoutInsetXClass = "px-4 md:px-6";

/** Centered content columns inside the dashboard inset (header + main share this width) */
export const layoutInsetContainerWideClass = "mx-auto w-full max-w-6xl";
export const layoutInsetContainerNarrowClass = layoutInsetContainerWideClass;

/** Default flex gap between blocks — SidebarContent */
export const layoutGapClass = "gap-2";

/** Tight gap — SidebarMenu */
export const layoutMenuGapClass = "gap-1";

/** Default control row height — SidebarMenuButton */
export const layoutRowClass = "h-8";

/** Primary chrome row — SidebarMenuButton `lg` / team switcher */
export const layoutRowLgClass = "h-12";

/** Page / section vertical stack */
export const layoutSectionStackClass = `flex min-w-0 flex-col ${layoutGapClass}`;

/** Main scrollable content (dashboard shell) */
export const layoutContentClass = `flex flex-1 min-w-0 flex-col ${layoutGapClass} ${layoutGutterClass}`;

/** Scrollable dashboard main below the inset header (single scroll container) */
export const layoutDashboardScrollClass = `flex min-h-0 flex-1 min-w-0 flex-col gap-4 overflow-x-hidden overflow-y-auto overscroll-y-contain pt-4 pb-2 [scrollbar-gutter:stable] ${layoutInsetXClass}`;

/** Vertical rhythm for dashboard page sections (title → stats → body) */
export const layoutDashboardPageStackClass = "flex min-w-0 flex-col gap-4";

/** Fixed inset header shell — matches SidebarHeader vertical rhythm */
export const layoutChromeClass = `flex shrink-0 flex-col ${layoutGapClass} py-2 ${layoutInsetXClass}`;

/** Inner row aligned to sidebar team switcher */
export const layoutChromeRowClass = `flex w-full min-w-0 items-center justify-between ${layoutRowLgClass} ${layoutGapClass}`;

/** In-page title row — grows with title, badges, and clamped description */
export const layoutPageHeaderRowClass =
  "flex w-full min-w-0 items-start justify-between gap-2 min-h-12 py-0.5";

/** In-page title row (DashboardSection, page heroes) */
export const layoutTitleRowClass = layoutPageHeaderRowClass;

/** Form / sheet field stacks */
export const layoutFormStackClass = `grid ${layoutGapClass}`;

/** Toolbar row above tables / filters */
export const layoutToolbarClass = `flex flex-col sm:flex-row ${layoutGapClass}`;

/** Group label typography — SidebarGroupLabel */
export const layoutGroupLabelClass =
  "flex h-8 shrink-0 items-center px-2 font-medium text-xs";

/** Page title typography — primary in-page heading */
export const layoutPageTitleClass =
  "font-semibold text-lg leading-tight tracking-tight sm:text-xl";
