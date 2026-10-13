"use client";

import { createEnvironmentInput } from "@env-manager/api/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod/v3";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const environmentNameSchema = createEnvironmentInput.pick({ name: true });

interface CreateEnvironmentDialogProps {
  onConfirm: (name: string) => Promise<void>;
  isPending: boolean;
  triggerText?: string;
  /** Icon-only trigger on small screens when paired with compactOnMobile */
  compactOnMobile?: boolean;
}

export function CreateEnvironmentDialog({
  onConfirm,
  isPending,
  triggerText = "Create Environment",
  compactOnMobile = false,
}: CreateEnvironmentDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(environmentNameSchema),
    defaultValues: { name: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: z.infer<typeof environmentNameSchema>) => {
    await onConfirm(data.name.trim());
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant={triggerText === "Add Environment" ? "outline" : "default"}
            size={triggerText === "Add Environment" ? "sm" : "default"}
            className={
              compactOnMobile
                ? "max-sm:size-11 max-sm:shrink-0 max-sm:px-0"
                : undefined
            }
            aria-label={compactOnMobile ? "Add environment" : undefined}
          />
        }
      >
        <Plus
          className={compactOnMobile ? "size-4 sm:me-2" : "me-2 h-4 w-4"}
          aria-hidden
        />
        <span className={compactOnMobile ? "hidden sm:inline" : undefined}>
          {triggerText}
        </span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Environment</DialogTitle>
          <DialogDescription>
            Add a new environment (e.g., development, staging, production).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  id="env-name"
                  label="Name"
                  required
                  error={fieldState.error?.message}
                >
                  <Input
                    {...field}
                    id="env-name"
                    placeholder="development"
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                </FormField>
              )}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <SubmitButton isLoading={isPending} loadingLabel="Creating…">
              Create
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
