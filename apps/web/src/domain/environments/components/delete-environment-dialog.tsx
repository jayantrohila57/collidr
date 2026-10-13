"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DeleteEnvironmentDialogProps {
  environmentName: string;
  onConfirm: () => Promise<void>;
  isPending: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function DeleteEnvironmentDialog({
  environmentName,
  onConfirm,
  isPending,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
}: DeleteEnvironmentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChangeProp ?? setInternalOpen;

  const handleConfirm = async () => {
    await onConfirm();
    setOpen(false);
  };

  return (
    <>
      {!hideTrigger ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 shrink-0"
                aria-label={`Delete ${environmentName} environment`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(true);
                }}
              />
            }
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </TooltipTrigger>
          <TooltipContent>Delete environment</TooltipContent>
        </Tooltip>
      ) : null}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete environment"
        description={`Delete "${environmentName}" and all variables in it? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        isPending={isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
