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
  SheetTrigger,
} from "@/components/ui/sheet";
import { layoutSheetPanelClass } from "@/lib/layout-spacing";

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
      </SheetTrigger>
      <SheetPopup variant="inset">
        <SheetHeader>
          <SheetTitle>Create Environment</SheetTitle>
          <SheetDescription>
            Add a new environment (e.g., development, staging, production).
          </SheetDescription>
        </SheetHeader>
        <form className="contents" onSubmit={form.handleSubmit(onSubmit)}>
          <SheetPanel className={layoutSheetPanelClass}>
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
          </SheetPanel>
          <SheetFooter>
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
          </SheetFooter>
        </form>
      </SheetPopup>
    </Sheet>
  );
}
