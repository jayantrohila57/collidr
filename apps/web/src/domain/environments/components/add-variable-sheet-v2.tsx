"use client";

import { variableKeySchema } from "@env-manager/api/validation";
import { useMemo, useState } from "react";
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  type VariableType,
  VariableTypeRadioCards,
} from "./variable-type-radio-cards";

export type DraftVariableRow = {
  id: string;
  key: string;
  value: string;
  note: string;
};

export type BatchVariablePayload = {
  environmentIds: string[];
  variables: Array<{
    key: string;
    value: string;
    note?: string;
    type: VariableType;
  }>;
};

interface EnvironmentOption {
  id: string;
  name: string;
}

interface AddVariableSheetV2Props {
  projectId: string;
  environments: EnvironmentOption[];
  defaultEnvironmentId: string;
  onConfirm: (data: BatchVariablePayload) => Promise<void>;
  isPending: boolean;
  triggerLayout?: "toolbar" | "tableEmpty";
}

function newRow(): DraftVariableRow {
  return {
    id: crypto.randomUUID(),
    key: "",
    value: "",
    note: "",
  };
}

function ValueInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <InputGroup>
      <InputGroupInput
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Value"
        className="font-mono"
        autoComplete="off"
      />
      <InputGroupAddon align="inline-end">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8"
          aria-label={visible ? "Hide value" : "Show value"}
          onClick={() => setVisible((v) => !v)}
        >
          <AppIcon
            name={visible ? "hide" : "reveal"}
            className="text-foreground"
          />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  );
}

export function AddVariableSheetV2({
  projectId,
  environments,
  defaultEnvironmentId,
  onConfirm,
  isPending,
  triggerLayout = "toolbar",
}: AddVariableSheetV2Props) {
  const isToolbar = triggerLayout === "toolbar";
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<VariableType>("secret");
  const [rows, setRows] = useState<DraftVariableRow[]>(() => [newRow()]);
  const [selectedEnvIds, setSelectedEnvIds] = useState<Set<string>>(
    () => new Set([defaultEnvironmentId]),
  );
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  const sortedEnvironments = useMemo(
    () => [...environments].sort((a, b) => a.name.localeCompare(b.name)),
    [environments],
  );

  const reset = () => {
    setType("secret");
    setRows([newRow()]);
    setSelectedEnvIds(new Set([defaultEnvironmentId]));
    setRowErrors({});
  };

  const validateRows = () => {
    const errors: Record<string, string> = {};
    for (const row of rows) {
      const keyResult = variableKeySchema.safeParse(row.key);
      if (!keyResult.success) {
        errors[row.id] = keyResult.error.issues[0]?.message ?? "Invalid key";
        continue;
      }
      if (!row.value.trim()) {
        errors[row.id] = "Value is required";
      }
    }
    setRowErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const toggleEnvironment = (id: string) => {
    setSelectedEnvIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEnvIds.size === 0) {
      return;
    }
    if (!validateRows()) {
      return;
    }

    try {
      await onConfirm({
        environmentIds: [...selectedEnvIds],
        variables: rows.map((row) => ({
          key: row.key.trim().toUpperCase(),
          value: row.value,
          note: row.note.trim() || undefined,
          type,
        })),
      });
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
        if (next) {
          setSelectedEnvIds((prev) =>
            prev.size > 0 ? prev : new Set([defaultEnvironmentId]),
          );
        }
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
      <FormSheetPopup className="sm:max-w-lg">
        <FormSheetHeader>
          <SheetTitleWithIcon icon="variable">
            Add environment variable
          </SheetTitleWithIcon>
          <SheetDescription>
            Add one or more variables and choose which environments receive
            them.
          </SheetDescription>
        </FormSheetHeader>
        <FormSheetForm onSubmit={handleSubmit}>
          <FormSheetBody className="gap-5">
            <FormField id="var-type" label="Type">
              <VariableTypeRadioCards value={type} onChange={setType} />
            </FormField>

            <div className="space-y-3">
              {rows.map((row, index) => (
                <div
                  key={row.id}
                  className="space-y-3 rounded-lg border border-border p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-muted-foreground text-xs">
                      Variable {index + 1}
                    </span>
                    {rows.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-destructive"
                        onClick={() =>
                          setRows((current) =>
                            current.filter((item) => item.id !== row.id),
                          )
                        }
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                  <FormField
                    id={`var-key-${row.id}`}
                    label="Key"
                    error={rowErrors[row.id]}
                    required
                  >
                    <Input
                      id={`var-key-${row.id}`}
                      value={row.key}
                      onChange={(e) => {
                        const key = e.target.value;
                        setRows((current) =>
                          current.map((item) =>
                            item.id === row.id ? { ...item, key } : item,
                          ),
                        );
                        if (rowErrors[row.id]) {
                          setRowErrors((errs) => {
                            const next = { ...errs };
                            delete next[row.id];
                            return next;
                          });
                        }
                      }}
                      placeholder="CLIENT_KEY"
                      className="font-mono uppercase"
                      aria-invalid={Boolean(rowErrors[row.id])}
                    />
                  </FormField>
                  <FormField id={`var-value-${row.id}`} label="Value" required>
                    <ValueInput
                      id={`var-value-${row.id}`}
                      value={row.value}
                      onChange={(value) =>
                        setRows((current) =>
                          current.map((item) =>
                            item.id === row.id ? { ...item, value } : item,
                          ),
                        )
                      }
                    />
                  </FormField>
                  <FormField
                    id={`var-note-${row.id}`}
                    label="Note"
                    hint="Optional — where to rotate, or who to contact."
                  >
                    <Textarea
                      id={`var-note-${row.id}`}
                      value={row.note}
                      onChange={(e) =>
                        setRows((current) =>
                          current.map((item) =>
                            item.id === row.id
                              ? { ...item, note: e.target.value }
                              : item,
                          ),
                        )
                      }
                      rows={2}
                      className="min-h-0 resize-none"
                    />
                  </FormField>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setRows((current) => [...current, newRow()])}
                disabled={rows.length >= 25}
              >
                <AppIcon name="plus" className="me-1.5 text-foreground" />
                Add another
              </Button>
            </div>

            <FormField
              id="var-envs"
              label="Environments"
              hint="Variables are created in each selected environment."
              required
            >
              <ul className="space-y-1 rounded-lg border border-border p-2">
                {sortedEnvironments.map((env) => {
                  const checked = selectedEnvIds.has(env.id);
                  return (
                    <li key={env.id}>
                      <label
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="size-4 rounded border-input"
                          checked={checked}
                          onChange={() => toggleEnvironment(env.id)}
                        />
                        <span className="truncate text-sm">{env.name}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </FormField>
            <input type="hidden" name="projectId" value={projectId} />
          </FormSheetBody>
          <FormSheetFooter>
            <SheetClose render={<Button variant="ghost" type="button" />}>
              Cancel
            </SheetClose>
            <SubmitButton
              isLoading={isPending}
              loadingLabel="Saving…"
              disabled={selectedEnvIds.size === 0}
            >
              Save
            </SubmitButton>
          </FormSheetFooter>
        </FormSheetForm>
      </FormSheetPopup>
    </Sheet>
  );
}
