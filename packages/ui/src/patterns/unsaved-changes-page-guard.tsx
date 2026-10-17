"use client";

import type { ReactNode } from "react";
import {
  type UseUnsavedChangesGuardOptions,
  useUnsavedChangesGuard,
} from "../hooks/use-unsaved-changes-guard";
import { DiscardChangesDialog } from "./discard-changes-dialog";

type UnsavedChangesPageGuardProps = Pick<
  UseUnsavedChangesGuardOptions,
  "isDirty" | "onDiscard"
> & {
  children: (helpers: {
    guardNavigation: (action: () => void) => void;
    allowNextNavigationWithoutPrompt: () => void;
  }) => ReactNode;
};

export function UnsavedChangesPageGuard({
  isDirty,
  onDiscard,
  children,
}: UnsavedChangesPageGuardProps) {
  const guard = useUnsavedChangesGuard({
    isDirty,
    enabled: true,
    onDiscard,
    blockNavigation: true,
  });

  return (
    <>
      {children({
        guardNavigation: guard.guardNavigation,
        allowNextNavigationWithoutPrompt: guard.allowNextCloseWithoutPrompt,
      })}
      <DiscardChangesDialog
        open={guard.discardDialogOpen}
        onOpenChange={(next) => {
          if (!next) guard.cancelDiscard();
          else guard.setDiscardDialogOpen(true);
        }}
        onDiscard={guard.confirmDiscard}
      />
    </>
  );
}
