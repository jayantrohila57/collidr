"use client";

import { Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { FormField } from "@/components/patterns/form-field";
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
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Environment {
  id: string;
  name: string;
}

interface EditEnvironmentDialogProps {
  environment: Environment;
  onConfirm: (id: string, name: string) => Promise<void>;
  isPending: boolean;
}

export function EditEnvironmentDialog({
  environment,
  onConfirm,
  isPending,
}: EditEnvironmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(environment.name);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(environment.name);
  }, [environment.id, environment.name]);

  useEffect(() => {
    if (open) {
      setName(environment.name);
      setError(null);
    }
  }, [open, environment.id, environment.name]);

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
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Environment</DialogTitle>
            <DialogDescription>
              Update the environment name. This will change how it appears in
              the tabs.
            </DialogDescription>
          </DialogHeader>
          <form key={environment.id} onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
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
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <SubmitButton isLoading={isPending} loadingLabel="Updating…">
                Update
              </SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
