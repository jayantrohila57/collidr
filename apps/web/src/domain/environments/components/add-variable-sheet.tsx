"use client";

import { variableKeySchema } from "@env-manager/api/validation";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";

interface AddVariableSheetProps {
  onConfirm: (data: { key: string; value: string }) => Promise<void>;
  isPending: boolean;
  /** Toolbar: icon-only below `sm`. Table empty: always labeled. */
  triggerLayout?: "toolbar" | "tableEmpty";
}

export function AddVariableSheet({
  onConfirm,
  isPending,
  triggerLayout = "toolbar",
}: AddVariableSheetProps) {
  const isToolbar = triggerLayout === "toolbar";
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateKey = (rawKey: string) => {
    const result = variableKeySchema.safeParse(rawKey);
    if (!result.success) {
      return result.error.issues[0]?.message ?? "Invalid key";
    }
    return null;
  };

  const reset = () => {
    setError(null);
    setKey("");
    setValue("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const keyError = validateKey(key);
    if (keyError) {
      setError(keyError);
      return;
    }
    setError(null);
    try {
      await onConfirm({ key: key.trim().toUpperCase(), value });
      setOpen(false);
      reset();
    } catch {
      // Toast + sheet stay open on failure.
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <SheetTrigger
        render={
          <Button
            size="sm"
            className={
              isToolbar
                ? "max-sm:size-8 max-sm:gap-0 max-sm:px-0 sm:gap-1.5"
                : "gap-1.5"
            }
            aria-label={isToolbar ? "Add variable" : undefined}
          />
        }
      >
        <AppIcon name="plus" className="text-current" />
        {isToolbar ? (
          <span className="sr-only sm:not-sr-only">Add variable</span>
        ) : (
          "Add variable"
        )}
      </SheetTrigger>
      <FormSheetPopup>
        <FormSheetHeader>
          <SheetTitleWithIcon icon="variable">Add Variable</SheetTitleWithIcon>
          <SheetDescription>Add a new environment variable.</SheetDescription>
        </FormSheetHeader>
        <FormSheetForm onSubmit={handleSubmit}>
          <FormSheetBody>
            <FormField
              id="var-key"
              label="Key"
              error={error ?? undefined}
              required
            >
              <Input
                id="var-key"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  if (error) setError(validateKey(e.target.value));
                }}
                placeholder="DATABASE_URL"
                className="font-mono"
                aria-invalid={Boolean(error)}
              />
            </FormField>
            <FormField id="var-value" label="Value" required>
              <Textarea
                id="var-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="your-value-here"
                rows={4}
                className="wrap-anywhere max-h-72 min-h-24 overflow-y-auto font-mono"
              />
            </FormField>
          </FormSheetBody>
          <FormSheetFooter>
            <SheetClose render={<Button variant="ghost" type="button" />}>
              Cancel
            </SheetClose>
            <SubmitButton isLoading={isPending} loadingLabel="Adding…">
              Add
            </SubmitButton>
          </FormSheetFooter>
        </FormSheetForm>
      </FormSheetPopup>
    </Sheet>
  );
}
