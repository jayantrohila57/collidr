"use client";

import { Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { FormField } from "@/components/patterns/form-field";
import { SubmitButton } from "@/components/patterns/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { layoutSheetPanelClass } from "@/lib/layout-spacing";

interface Environment {
  id: string;
  name: string;
}

interface EditEnvironmentSheetProps {
  environment: Environment;
  onConfirm: (id: string, name: string) => Promise<void>;
  isPending: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function EditEnvironmentSheet({
  environment,
  onConfirm,
  isPending,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
}: EditEnvironmentSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChangeProp ?? setInternalOpen;
  const [name, setName] = useState(environment.name);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(environment.name);
  }, [environment.name]);

  useEffect(() => {
    if (open) {
      setName(environment.name);
      setError(null);
    }
  }, [open, environment.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Environment name is required");
      return;
    }
    if (!/^[a-zA-Z0-9][a-zA-Z0-9 _-]*$/.test(trimmed)) {
      setError("Use letters, numbers, spaces, hyphens, and underscores only.");
      return;
    }
    setError(null);
    await onConfirm(environment.id, trimmed);
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setName(environment.name);
      setError(null);
    }
    setOpen(newOpen);
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
                aria-label={`Edit ${environment.name} environment`}
                onClick={(e) => {
                  e.stopPropagation();
                  setName(environment.name);
                  setError(null);
                  setOpen(true);
                }}
              />
            }
          >
            <Edit className="h-3.5 w-3.5" aria-hidden />
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end">
            Edit environment
          </TooltipContent>
        </Tooltip>
      ) : null}
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetPopup variant="inset">
          <SheetHeader>
            <SheetTitle>Edit Environment</SheetTitle>
            <SheetDescription>
              Update the environment name. This will change how it appears in
              the tabs.
            </SheetDescription>
          </SheetHeader>
          <form
            key={environment.id}
            className="contents"
            onSubmit={handleSubmit}
          >
            <SheetPanel className={layoutSheetPanelClass}>
              <FormField
                id={`env-name-${environment.id}`}
                label="Name"
                error={error ?? undefined}
                required
              >
                <Input
                  id={`env-name-${environment.id}`}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="development"
                  aria-invalid={Boolean(error)}
                />
              </FormField>
            </SheetPanel>
            <SheetFooter>
              <SheetClose render={<Button variant="ghost" type="button" />}>
                Cancel
              </SheetClose>
              <SubmitButton isLoading={isPending} loadingLabel="Updating…">
                Update
              </SubmitButton>
            </SheetFooter>
          </form>
        </SheetPopup>
      </Sheet>
    </>
  );
}
