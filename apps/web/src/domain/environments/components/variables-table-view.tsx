"use client";

import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import { useCallback, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableActionsColumnHeader } from "@/components/data-table/data-table-actions-column";
import { variablesTableEmpty } from "@/components/data-table/data-table-empty-presets";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { AppIcon } from "@/components/patterns/app-icon";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";
import { SecretValue } from "@/components/patterns/secret-value";
import { TableLeadingCell } from "@/components/patterns/table-leading-cell";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { AddVariableSheet } from "./add-variable-sheet";
import { EditVariableSheet } from "./edit-variable-sheet";
import { VariableActorLabel } from "./variable-actor-label";

interface Variable {
  id: string;
  key: string;
  value?: string;
  environmentId: string;
  createdAt: string;
  updatedAt: string;
  type?: "secret" | "config";
  note?: string | null;
  updatedByUser?: {
    id: string;
    name: string;
    image?: string | null;
  } | null;
}

interface VariablesTableViewProps {
  variables: Variable[];
  isLoading?: boolean;
  revealedIds: Set<string>;
  revealingIds?: Set<string>;
  onReveal: (id: string) => void;
  onEdit: (variable: Variable) => void;
  onDelete: (id: string) => void;
  onAddVariable: (data: { key: string; value: string }) => Promise<void>;
  onFetchValue: (id: string, options?: { force?: boolean }) => Promise<string>;
  isAddingVariable: boolean;
  isUpdating?: boolean;
  variablesV2Enabled?: boolean;
  addSheetEmpty?: React.ReactNode;
  addSheetToolbar?: React.ReactNode;
}

const columnHelper = legacyCreateColumnHelper<Variable>();

export function VariablesTableView({
  variables,
  isLoading = false,
  revealedIds,
  revealingIds,
  onReveal,
  onEdit,
  onDelete,
  onAddVariable,
  onFetchValue,
  isAddingVariable,
  isUpdating = false,
  variablesV2Enabled = false,
  addSheetEmpty,
  addSheetToolbar,
}: VariablesTableViewProps) {
  const isSecret = (variable: Variable) =>
    variablesV2Enabled && (variable.type ?? "secret") === "secret";

  const defaultEmptyAdd = (
    <AddVariableSheet
      onConfirm={onAddVariable}
      isPending={isAddingVariable}
      triggerLayout="tableEmpty"
    />
  );

  const defaultToolbarAdd = (
    <AddVariableSheet
      onConfirm={onAddVariable}
      isPending={isAddingVariable}
      triggerLayout="toolbar"
    />
  );
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    key: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editVariable, setEditVariable] = useState<Variable | null>(null);
  const [editLoadingValue, setEditLoadingValue] = useState(false);
  const [expandedValueIds, setExpandedValueIds] = useState<Set<string>>(
    () => new Set(),
  );

  const releaseOverlayPointerLock = () => {
    document.body.style.pointerEvents = "";
    document.documentElement.style.pointerEvents = "";
  };

  const handleDelete = useCallback((variable: Variable) => {
    setDeleteTarget({ id: variable.id, key: variable.key });
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (deleteTarget) {
      await onDelete(deleteTarget.id);
      setDeleteDialogOpen(false);
    }
  };

  const handleEdit = useCallback(
    (variable: Variable) => {
      window.setTimeout(() => {
        void (async () => {
          setEditVariable(variable);
          setEditDialogOpen(true);
          if (isSecret(variable)) {
            setEditLoadingValue(false);
            return;
          }
          setEditLoadingValue(true);
          try {
            const value = await onFetchValue(variable.id, { force: true });
            setEditVariable((current) =>
              current?.id === variable.id ? { ...current, value } : current,
            );
          } finally {
            setEditLoadingValue(false);
          }
        })();
      }, 0);
    },
    [onFetchValue, variablesV2Enabled],
  );

  const toggleValueExpanded = useCallback((id: string) => {
    setExpandedValueIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor("key", {
        enableSorting: false,
        meta: {
          className:
            "min-w-0 max-w-none w-auto py-2 ps-2 pe-1 sm:max-w-[12rem] sm:py-2.5 sm:ps-2.5 sm:pe-2.5",
          headerClassName: "ps-2 sm:ps-2.5",
        },
        header: () => (
          <span className="font-medium text-muted-foreground text-xs">Key</span>
        ),
        cell: ({ row }) => {
          const variable = row.original;
          const secret = isSecret(variable);
          const isRevealed = secret ? false : revealedIds.has(variable.id);
          return (
            <div className="min-w-0">
              <div className="hidden min-w-0 sm:block">
                <TableLeadingCell leading={<AppIcon name="variable" />}>
                  <span className="block truncate font-medium font-mono text-sm">
                    {variable.key}
                  </span>
                </TableLeadingCell>
              </div>
              <div className="min-w-0 sm:hidden">
                <span className="block truncate font-medium font-mono text-xs">
                  {variable.key}
                </span>
                {secret ? (
                  <span className="mt-0.5 text-muted-foreground text-xs">
                    Hidden
                  </span>
                ) : (
                  <SecretValue
                    revealed={isRevealed}
                    value={variable.value}
                    className="mt-0.5 text-muted-foreground text-xs"
                  />
                )}
                {variablesV2Enabled && variable.updatedByUser ? (
                  <VariableActorLabel
                    actor={variable.updatedByUser}
                    at={variable.updatedAt}
                    compact
                    className="mt-1"
                  />
                ) : null}
              </div>
            </div>
          );
        },
      }),
      ...(variablesV2Enabled
        ? [
            columnHelper.display({
              id: "updatedBy",
              meta: {
                className: "hidden min-w-0 py-2.5 md:table-cell",
              },
              header: () => (
                <span className="font-medium text-muted-foreground text-xs">
                  Last updated by
                </span>
              ),
              enableSorting: false,
              cell: ({ row }) => {
                const variable = row.original;
                return (
                  <VariableActorLabel
                    actor={variable.updatedByUser}
                    at={variable.updatedAt}
                  />
                );
              },
            }),
          ]
        : []),
      columnHelper.display({
        id: "value",
        meta: {
          className:
            "hidden min-w-0 max-w-[10rem] py-2.5 sm:table-cell md:max-w-[14rem]",
        },
        header: "Value",
        enableSorting: false,
        cell: ({ row }) => {
          const variable = row.original;
          const secret = isSecret(variable);
          if (secret) {
            return (
              <span className="font-mono text-muted-foreground text-sm">
                Hidden
              </span>
            );
          }
          const isRevealed = revealedIds.has(variable.id);
          const isValueExpanded = expandedValueIds.has(variable.id);
          const showExpand =
            isRevealed && Boolean(variable.value && variable.value.length > 80);

          return (
            <div>
              <SecretValue
                revealed={isRevealed}
                value={variable.value}
                expanded={isValueExpanded}
              />
              {showExpand ? (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => toggleValueExpanded(variable.id)}
                >
                  {isValueExpanded ? "Collapse" : "Expand"}
                </Button>
              ) : null}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        meta: {
          className: "w-10 py-2 pe-2 ps-0 sm:py-2.5 sm:pe-2.5",
        },
        header: () => <DataTableActionsColumnHeader />,
        enableSorting: false,
        cell: ({ row }) => {
          const variable = row.original;
          const secret = isSecret(variable);
          const isRevealed = secret ? false : revealedIds.has(variable.id);

          return (
            <div className="flex justify-end">
              <DataTableRowActions
                label="Variable actions"
                actions={[
                  ...(!secret
                    ? [
                        {
                          label: isRevealed ? "Hide value" : "Reveal value",
                          icon: (
                            <AppIcon
                              name={isRevealed ? "hide" : "reveal"}
                              className="me-2 text-foreground"
                            />
                          ),
                          disabled: revealingIds?.has(variable.id),
                          onSelect: () => onReveal(variable.id),
                        },
                        {
                          label: "Copy value",
                          icon: (
                            <AppIcon
                              name="copy"
                              className="me-2 text-foreground"
                            />
                          ),
                          disabled: !isRevealed || !variable.value,
                          onSelect: () => {
                            void navigator.clipboard.writeText(
                              variable.value ?? "",
                            );
                            toast.success("Copied to clipboard");
                          },
                        },
                      ]
                    : []),
                  {
                    label: "Edit",
                    icon: (
                      <AppIcon name="edit" className="me-2 text-foreground" />
                    ),
                    onSelect: () => handleEdit(variable),
                  },
                  {
                    label: "Delete",
                    icon: (
                      <AppIcon name="delete" className="me-2 text-foreground" />
                    ),
                    destructive: true,
                    onSelect: () => handleDelete(variable),
                  },
                ]}
              />
            </div>
          );
        },
      }),
    ],
    [
      expandedValueIds,
      handleDelete,
      handleEdit,
      isSecret,
      onReveal,
      revealedIds,
      revealingIds,
      toggleValueExpanded,
      variablesV2Enabled,
    ],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={variables}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search variables…"
        enablePagination={variables.length > 15}
        pageSize={15}
        caption="Environment variables"
        captionSrOnly
        framed
        compactLayout
        empty={variablesTableEmpty(addSheetEmpty ?? defaultEmptyAdd)}
        primaryAction={
          variables.length > 0 ? (addSheetToolbar ?? defaultToolbarAdd) : null
        }
      />

      {editVariable && (
        <EditVariableSheet
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setEditVariable(null);
              setEditLoadingValue(false);
              releaseOverlayPointerLock();
            }
          }}
          variable={editVariable}
          isLoadingValue={editLoadingValue}
          isSecret={editVariable ? isSecret(editVariable) : false}
          showNoteField={variablesV2Enabled}
          onConfirm={async (data) => {
            const updatedVariable: Variable = {
              ...editVariable,
              key: data.key,
              value: data.value,
              note: data.note,
            };
            await onEdit(updatedVariable);
          }}
          isPending={isUpdating}
        />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onOpenChangeComplete={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Delete variable"
        description={`Delete "${deleteTarget?.key ?? "this variable"}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
}
