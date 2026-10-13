"use client";

import type { ComponentProps, ReactNode, RefObject } from "react";
import { useEffect } from "react";
import { DiscardChangesDialog } from "@/components/patterns/discard-changes-dialog";
import { FormSheetGuardProvider } from "@/components/patterns/form-sheet-guard-context";
import { Dialog } from "@/components/ui/dialog";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";

export type GuardedDialogProps = ComponentProps<typeof Dialog> & {
  isDirty: boolean;
  onDiscard?: () => void;
  onClosed?: () => void;
  closeWithoutPromptRef?: RefObject<(() => void) | null>;
  children: ReactNode;
};

export function GuardedDialog({
  isDirty,
  onDiscard,
  onClosed,
  closeWithoutPromptRef,
  open,
  onOpenChange,
  children,
  ...props
}: GuardedDialogProps) {
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
      <Dialog
        open={open}
        onOpenChange={(next) =>
          guard.handleOpenChange(next, (applied) => {
            onOpenChange?.(applied);
            if (!applied) onClosed?.();
          })
        }
        {...props}
      >
        {children}
      </Dialog>
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
