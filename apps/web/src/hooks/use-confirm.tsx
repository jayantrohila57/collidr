"use client";

import { useCallback, useState } from "react";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";

export type ConfirmRequest = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
};

export function useConfirm() {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const confirm = useCallback((options: ConfirmRequest) => {
    setRequest(options);
    setOpen(true);
  }, []);

  const reset = useCallback(() => {
    if (isPending) return;
    setOpen(false);
    setRequest(null);
  }, [isPending]);

  const handleConfirm = async () => {
    if (!request) return;
    setIsPending(true);
    try {
      await request.onConfirm();
      setOpen(false);
      setRequest(null);
    } catch {
      // Caller surfaces errors (e.g. actionToast); keep dialog open.
    } finally {
      setIsPending(false);
    }
  };

  const ConfirmDialogOutlet = request ? (
    <ConfirmDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
      title={request.title}
      description={request.description}
      confirmLabel={request.confirmLabel}
      cancelLabel={request.cancelLabel}
      variant={request.variant}
      onConfirm={handleConfirm}
      isPending={isPending}
    />
  ) : null;

  return {
    confirm,
    ConfirmDialog: ConfirmDialogOutlet,
    isConfirmPending: isPending,
  };
}
