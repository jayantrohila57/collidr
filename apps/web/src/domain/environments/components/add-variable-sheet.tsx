"use client";

import { variableKeySchema } from "@collidr/api/validation";
import { useRef, useState } from "react";
import {
  PageHeaderActionLabel,
  pageHeaderActionButtonClassName,
} from "@/components/layout/page-header-action-button";
import { AppIcon } from "@/components/patterns/app-icon";
import { FormField } from "@/components/patterns/form-field";
import {
  FormSheetBody,
  FormSheetFooter,
  FormSheetForm,
  FormSheetHeader,
  FormSheetPopup,
} from "@/components/patterns/form-sheet";
import { GuardedSheet } from "@/components/patterns/guarded-sheet";
import { SheetTitleWithIcon } from "@/components/patterns/sheet-title-with-icon";
import { SubmitButton } from "@/components/patterns/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SheetClose,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { isVariablesV2EnabledOnClient } from "@/lib/variables-v2-enabled";
import { AddVariableSheetV2 } from "./add-variable-sheet-v2";

interface AddVariableSheetProps {
  onConfirm: (data: { key: string; value: string }) => Promise<void>;
  onConfirmBatch?: (data: {
    environmentIds: string[];
    variables: Array<{
      key: string;
      value: string;
      type: "secret" | "config";
      note?: string;
    }>;
  }) => Promise<void>;
  environments?: { id: string; name: string }[];
  defaultEnvironmentId?: string;
  isPending: boolean;
  /** Toolbar: icon-only below `sm`. Table empty: always labeled. */
  triggerLayout?: "toolbar" | "tableEmpty";
}

function AddVariableSheetLegacy({
  onConfirm,
  isPending,
  triggerLayout = "toolbar",
}: Omit<
  AddVariableSheetProps,
  "onConfirmBatch" | "environments" | "defaultEnvironmentId"
>) {
  const isToolbar = triggerLayout === "toolbar";
  const closeWithoutPromptRef = useRef<(() => void) | null>(null);
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
      reset();
      closeWithoutPromptRef.current?.();
      setOpen(false);
    } catch {
      // Toast + sheet stay open on failure.
    }
  };

  return (
    <GuardedSheet
      open={open}
      onOpenChange={setOpen}
      isDirty={key.length > 0 || value.length > 0}
      onDiscard={reset}
      onClosed={reset}
      closeWithoutPromptRef={closeWithoutPromptRef}
    >
      <SheetTrigger
        render={
          <Button
            size="sm"
            className={pageHeaderActionButtonClassName(
              isToolbar ? "sm:gap-1.5" : "gap-1.5",
              isToolbar,
            )}
          />
        }
      >
        <AppIcon name="plus" className="text-current" />
        {isToolbar ? (
          <PageHeaderActionLabel>Add variable</PageHeaderActionLabel>
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
    </GuardedSheet>
  );
}

export function AddVariableSheet({
  onConfirm,
  onConfirmBatch,
  environments,
  defaultEnvironmentId,
  isPending,
  triggerLayout = "toolbar",
}: AddVariableSheetProps) {
  const v2 =
    isVariablesV2EnabledOnClient() &&
    environments &&
    environments.length > 0 &&
    defaultEnvironmentId &&
    onConfirmBatch;

  if (v2) {
    return (
      <AddVariableSheetV2
        environments={environments}
        defaultEnvironmentId={defaultEnvironmentId}
        onConfirm={onConfirmBatch}
        isPending={isPending}
        triggerLayout={triggerLayout}
      />
    );
  }

  return (
    <AddVariableSheetLegacy
      onConfirm={onConfirm}
      isPending={isPending}
      triggerLayout={triggerLayout}
    />
  );
}
