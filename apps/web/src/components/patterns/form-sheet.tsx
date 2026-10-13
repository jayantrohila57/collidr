import type { ComponentProps, FormHTMLAttributes, ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetFooter,
  SheetHeader,
  SheetPopup,
} from "@/components/ui/sheet";
import { layoutFormStackClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

/** Matches coss `SheetPanel` padding (aligned with header/footer `px-6`). */
export const formSheetPanelPaddingClass =
  "p-6 in-[[data-slot=sheet-popup]:has([data-slot=sheet-header])]:pt-1 in-[[data-slot=sheet-popup]:has([data-slot=sheet-footer]:not(.border-t))]:pb-1";

/** Full-height inset sheet shell (viewport minus inset margin). */
export const formSheetPopupClassName =
  "flex h-full min-h-0 max-h-full flex-col self-stretch";

/** Form column between header and footer. */
export const formSheetFormClassName = "flex min-h-0 flex-1 flex-col";

/** Scrollable panel region — uses coss `SheetPanel` horizontal padding (`px-6`). */
export const formSheetPanelClassName = "min-h-0 flex-1";

/** Vertical stack for fields inside the panel (no extra horizontal padding). */
export const formSheetFieldsClassName = layoutFormStackClass;

export function FormSheet(props: ComponentProps<typeof Sheet>) {
  return <Sheet {...props} />;
}

export function FormSheetPopup({
  className,
  variant = "inset",
  ...props
}: ComponentProps<typeof SheetPopup>) {
  return (
    <SheetPopup
      variant={variant}
      className={cn(formSheetPopupClassName, className)}
      {...props}
    />
  );
}

export function FormSheetHeader({
  className,
  ...props
}: ComponentProps<typeof SheetHeader>) {
  return <SheetHeader className={cn("shrink-0", className)} {...props} />;
}

export function FormSheetForm({
  className,
  children,
  ...props
}: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form className={cn(formSheetFormClassName, className)} {...props}>
      {children}
    </form>
  );
}

export function FormSheetBody({
  className,
  children,
  panelClassName,
}: {
  className?: string;
  panelClassName?: string;
  children: ReactNode;
}) {
  return (
    <ScrollArea
      className={cn(formSheetPanelClassName, panelClassName)}
      overscrollContain
      scrollFade
    >
      <div className={formSheetPanelPaddingClass} data-slot="sheet-panel">
        <div className={cn(formSheetFieldsClassName, className)}>
          {children}
        </div>
      </div>
    </ScrollArea>
  );
}

export function FormSheetFooter({
  className,
  ...props
}: ComponentProps<typeof SheetFooter>) {
  return <SheetFooter className={cn("shrink-0", className)} {...props} />;
}
