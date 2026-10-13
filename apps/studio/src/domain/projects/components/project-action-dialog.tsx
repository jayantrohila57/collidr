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
    />
  );
}
