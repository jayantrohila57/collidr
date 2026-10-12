"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { SubmitButton } from "@/components/patterns/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DeleteEnvironmentDialogProps {
  environmentName: string;
  onConfirm: () => Promise<void>;
  isPending: boolean;
}

export function DeleteEnvironmentDialog({
  environmentName,
  onConfirm,
  isPending,
}: DeleteEnvironmentDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    await onConfirm();
    setOpen(false);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 shrink-0 text-destructive hover:text-destructive"
            aria-label={`Delete ${environmentName} environment`}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete environment</TooltipContent>
      </Tooltip>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete environment</DialogTitle>
            <DialogDescription>
              Delete "{environmentName}" and all variables in it? This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <SubmitButton
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              isLoading={isPending}
              loadingLabel="Deleting…"
            >
              Delete
            </SubmitButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
