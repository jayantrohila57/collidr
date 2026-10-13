"use client";

import { variableKeySchema } from "@env-manager/api/validation";
import { useEffect, useState } from "react";
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
import { Sheet, SheetClose, SheetDescription } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

interface EditVariableSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variable: {
    id: string;
    key: string;
    value?: string;
  };
  isLoadingValue?: boolean;
  onConfirm: (data: {
    id: string;
    key: string;
    value: string;
  }) => Promise<void>;
  isPending: boolean;
}

export function EditVariableSheet({
  open,
  onOpenChange,
  variable,
  isLoadingValue = false,
  onConfirm,
  isPending,
}: EditVariableSheetProps) {
  const [key, setKey] = useState(variable.key);
  const [value, setValue] = useState(variable.value || "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setKey(variable.key);
      setValue(variable.value ?? "");
      setError(null);
    }
  }, [open, variable.key, variable.value]);

  const validateKey = (rawKey: string) => {
    const result = variableKeySchema.safeParse(rawKey);
    if (!result.success) {
      return result.error.issues[0]?.message ?? "Invalid key";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const keyError = validateKey(key);
    if (keyError) {
      setError(keyError);
      return;
    }
    setError(null);
    await onConfirm({
      id: variable.id,
      key: key.trim().toUpperCase(),
      value,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <FormSheetPopup>
        <FormSheetHeader>
          <SheetTitleWithIcon icon="variable">Edit Variable</SheetTitleWithIcon>
          <SheetDescription>
            Update the key and value. The current value loads when you open this
            sheet.
          </SheetDescription>
        </FormSheetHeader>
        <FormSheetForm onSubmit={handleSubmit}>
          <FormSheetBody>
            <FormField
              id="edit-key"
              label="Key"
              error={error ?? undefined}
              required
            >
              <Input
                id="edit-key"
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
            <FormField id="edit-value" label="Value" required>
              <div className="relative min-h-24">
                {isLoadingValue ? (
                  <>
                    <Skeleton
                      className="absolute inset-0 min-h-24 w-full rounded-md"
                      aria-hidden
                    />
                    <span className="sr-only">Loading current value</span>
                  </>
                ) : null}
                <Textarea
                  id="edit-value"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="your-value-here"
                  rows={3}
                  disabled={isLoadingValue}
                  className="wrap-anywhere max-h-72 min-h-24 overflow-y-auto font-mono"
                />
              </div>
            </FormField>
          </FormSheetBody>
          <FormSheetFooter>
            <SheetClose render={<Button variant="ghost" type="button" />}>
              Cancel
            </SheetClose>
            <SubmitButton
              isLoading={isPending}
              loadingLabel="Updating…"
              disabled={isLoadingValue}
            >
              Update
            </SubmitButton>
          </FormSheetFooter>
        </FormSheetForm>
      </FormSheetPopup>
    </Sheet>
  );
}
