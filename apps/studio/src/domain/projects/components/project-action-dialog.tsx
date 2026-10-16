"use client";

import { ConfirmDialog } from "@/components/patterns/confirm-dialog";

interface ProjectActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionText: string;
  variant?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
  /** Require typing this value (e.g. project name) before confirming. */
  confirmText?: string;
}

export function ProjectActionDialog({
  open,
  onOpenChange,
  title,
  description,
  actionText,
  variant = "default",
  onConfirm,
  isPending = false,
  confirmText,
}: ProjectActionDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmLabel={actionText}
      variant={variant}
      onConfirm={onConfirm}
      isPending={isPending}
      confirmText={confirmText}
    />
  );
}
