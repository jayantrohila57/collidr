"use client";

import { createEnvironmentInput } from "@env-manager/api/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod/v3";
import { AppIcon } from "@/components/patterns/app-icon";
import { FormField } from "@/components/patterns/form-field";
import {
  FormSheetBody,
  FormSheetFooter,
  FormSheetForm,
  FormSheetHeader,
  FormSheetPopup,
} from "@/components/patterns/form-sheet";
import { SheetTitleWithIcon } from "@/components/patterns/sheet-title-with-icon";
import { SubmitButton } from "@/components/patterns/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

const environmentNameSchema = createEnvironmentInput.pick({ name: true });

interface CreateEnvironmentSheetProps {
  onConfirm: (name: string) => Promise<void>;
  isPending: boolean;
  triggerText?: string;
  compactOnMobile?: boolean;
}

export function CreateEnvironmentSheet({
  onConfirm,
  isPending,
  triggerText = "Create Environment",
  compactOnMobile = false,
}: CreateEnvironmentSheetProps) {
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant={triggerText === "Add Environment" ? "outline" : "default"}
            size={triggerText === "Add Environment" ? "sm" : "default"}
            className={
              compactOnMobile
                ? "max-sm:size-11 max-sm:shrink-0 max-sm:gap-0 max-sm:px-0"
                : "gap-2"
            }
            aria-label={compactOnMobile ? "Add environment" : undefined}
          />
        }
      >
        <AppIcon
          name="plus"
          className={compactOnMobile ? "text-current" : "text-current"}
        />
        <span className={compactOnMobile ? "hidden sm:inline" : undefined}>
          {triggerText}
        </span>
      </SheetTrigger>
      <FormSheetPopup>
        <FormSheetHeader>
          <SheetTitleWithIcon icon="environment">
            Create Environment
          </SheetTitleWithIcon>
          <SheetDescription>
            Add a new environment (e.g., development, staging, production).
          </SheetDescription>
        </FormSheetHeader>
        <FormSheetForm onSubmit={form.handleSubmit(onSubmit)}>
          <FormSheetBody>
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
          </FormSheetBody>
          <FormSheetFooter>
            <SheetClose
              render={
                <Button variant="ghost" type="button" disabled={isPending} />
              }
            >
              Cancel
            </SheetClose>
            <SubmitButton isLoading={isPending} loadingLabel="Creating…">
              Create
            </SubmitButton>
          </FormSheetFooter>
        </FormSheetForm>
      </FormSheetPopup>
    </Sheet>
  );
}
