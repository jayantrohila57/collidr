"use client";

import { Sheet } from "@loftlancer/ui/sheet";
import type { ComponentProps, ReactNode, RefObject } from "react";
import { useEffect } from "react";
import { DiscardChangesDialog } from "@/components/patterns/discard-changes-dialog";
import { FormSheetGuardProvider } from "@/components/patterns/form-sheet-guard-context";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";

export type GuardedSheetProps = ComponentProps<typeof Sheet> & {
  isDirty?: boolean;
  onDiscard?: () => void;
  onClosed?: () => void;
  closeWithoutPromptRef?: RefObject<(() => void) | null>;
  children: ReactNode;
};

export function GuardedSheet({
  isDirty = false,
  onDiscard,
  onClosed,
  closeWithoutPromptRef,
  open,
  onOpenChange,
  children,
  ...props
}: GuardedSheetProps) {
  const guard = useUnsavedChangesGuard({
    isDirty,
    enabled: Boolean(open),
    onDiscard,
  });

  useEffect(() => {
    if (!closeWithoutPromptRef) return;
    closeWithoutPromptRef.current = guard.allowNextCloseWithoutPrompt;
    return () => {
      closeWithoutPromptRef.current = null;
    };
  }, [closeWithoutPromptRef, guard.allowNextCloseWithoutPrompt]);

  return (
    <FormSheetGuardProvider
      allowNextCloseWithoutPrompt={guard.allowNextCloseWithoutPrompt}
    >
      <Sheet
        open={Boolean(open) && !guard.discardDialogOpen}
        onOpenChange={(next, eventDetails) =>
          guard.handleOpenChange(next, (applied) => {
            onOpenChange?.(applied, eventDetails);
            if (!applied) onClosed?.();
          })
        }
        {...props}
      >
        {children}
      </Sheet>
      <DiscardChangesDialog
        open={guard.discardDialogOpen}
        onOpenChange={(next) => {
          if (!next) guard.cancelDiscard();
          else guard.setDiscardDialogOpen(true);
        }}
        onDiscard={guard.confirmDiscard}
      />
    </FormSheetGuardProvider>
  );
}
