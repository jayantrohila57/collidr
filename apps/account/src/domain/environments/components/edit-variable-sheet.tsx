"use client";

import { variableKeySchema } from "@loftlancer/api/validation";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormField } from "@/components/patterns/form-field";
import {
  FormSheetBody,
  FormSheetFooter,
  FormSheetForm,
  FormSheetHeader,
  FormSheetPopup,
} from "@/components/patterns/form-sheet";
import { GuardedSheet } from "@/components/patterns/guarded-sheet";
import type { ProvenanceUser } from "@/components/patterns/provenance-attribution";
import { SheetTitleWithIcon } from "@/components/patterns/sheet-title-with-icon";
import { SubmitButton } from "@/components/patterns/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SheetClose, SheetDescription } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { isVariablesV2EnabledOnClient } from "@/lib/variables-v2-enabled";
import { EditVariableSheetV2 } from "./edit-variable-sheet-v2";

interface EditVariableSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variable: {
    id: string;
    key: string;
    value?: string;
    type?: "secret" | "config";
    note?: string | null;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: ProvenanceUser | null;
    updatedBy?: ProvenanceUser | null;
  };
  isLoadingValue?: boolean;
  onConfirm: (data: {
    id: string;
    key: string;
    value: string;
    type?: "secret" | "config";
    note?: string | null;
  }) => Promise<void>;
  isPending: boolean;
}

function EditVariableSheetLegacy({
  open,
  onOpenChange,
  variable,
  isLoadingValue = false,
  onConfirm,
  isPending,
}: Omit<EditVariableSheetProps, "variable"> & {
  variable: { id: string; key: string; value?: string };
}) {
  const closeWithoutPromptRef = useRef<(() => void) | null>(null);
  const [key, setKey] = useState(variable.key);
  const [value, setValue] = useState(variable.value || "");
  const [error, setError] = useState<string | null>(null);

  const baselineKey = variable.key;
  const baselineValue = variable.value ?? "";

  useEffect(() => {
    if (open) {
      setKey(baselineKey);
      setValue(baselineValue);
      setError(null);
    }
  }, [open, baselineKey, baselineValue]);

  const isDirty = useMemo(
    () =>
      key.trim().toUpperCase() !== baselineKey.trim().toUpperCase() ||
      value !== baselineValue,
    [baselineKey, baselineValue, key, value],
  );

  const revertFields = () => {
    setKey(baselineKey);
    setValue(baselineValue);
    setError(null);
  };

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
    try {
      await onConfirm({
        id: variable.id,
        key: key.trim().toUpperCase(),
        value,
      });
      closeWithoutPromptRef.current?.();
      onOpenChange(false);
    } catch {
      // Toast + sheet stay open on failure.
    }
  };

  return (
    <GuardedSheet
      open={open}
      onOpenChange={onOpenChange}
      isDirty={isDirty}
      onDiscard={revertFields}
      closeWithoutPromptRef={closeWithoutPromptRef}
    >
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
    </GuardedSheet>
  );
}

export function EditVariableSheet({
  open,
  onOpenChange,
  variable,
  isLoadingValue,
  onConfirm,
  isPending,
}: EditVariableSheetProps) {
  if (
    isVariablesV2EnabledOnClient() &&
    variable.createdAt &&
    variable.updatedAt
  ) {
    return (
      <EditVariableSheetV2
        open={open}
        onOpenChange={onOpenChange}
        variable={{
          id: variable.id,
          key: variable.key,
          value: variable.value,
          type: variable.type,
          note: variable.note,
          createdAt: variable.createdAt,
          updatedAt: variable.updatedAt,
          createdBy: variable.createdBy,
          updatedBy: variable.updatedBy,
        }}
        isLoadingValue={isLoadingValue}
        onConfirm={onConfirm}
        isPending={isPending}
      />
    );
  }

  return (
    <EditVariableSheetLegacy
      open={open}
      onOpenChange={onOpenChange}
      variable={variable}
      isLoadingValue={isLoadingValue}
      onConfirm={onConfirm}
      isPending={isPending}
    />
  );
}
