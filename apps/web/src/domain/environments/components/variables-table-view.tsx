"use client";

import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import { Copy, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableEmpty } from "@/components/data-table/data-table-empty";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";
import { SecretValue } from "@/components/patterns/secret-value";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { AddVariableSheet } from "./add-variable-sheet";
import { EditVariableSheet } from "./edit-variable-sheet";

interface Variable {
  id: string;
  key: string;
  value?: string;
  environmentId: string;
  createdAt: string;
  updatedAt: string;
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
}: VariablesTableViewProps) {
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
    [onFetchValue],
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
        meta: {
          className: "w-[38%] max-w-[9rem] min-w-0 sm:max-w-[12rem]",
        },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Key" />
        ),
        cell: ({ row }) => {
          const variable = row.original;
          const isRevealed = revealedIds.has(variable.id);
          return (
            <div className="min-w-0">
              <span className="block truncate font-medium font-mono text-xs sm:text-sm">
                {variable.key}
              </span>
              <div className="mt-1 flex min-w-0 items-center gap-1 sm:hidden">
                <SecretValue
                  revealed={isRevealed}
                  value={variable.value}
                  className="min-w-0 flex-1 text-xs"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={isRevealed ? "Hide value" : "Reveal value"}
                  disabled={revealingIds?.has(variable.id)}
                  onClick={() => onReveal(variable.id)}
                >
                  {isRevealed ? (
                    <EyeOff className="size-4" aria-hidden />
                  ) : (
                    <Eye className="size-4" aria-hidden />
                  )}
                </Button>
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "value",
        meta: {
          className:
            "hidden min-w-0 max-w-[10rem] sm:table-cell md:max-w-[14rem]",
        },
        header: "Value",
        enableSorting: false,
        cell: ({ row }) => {
          const variable = row.original;
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
          className:
            "sticky end-0 z-10 w-12 bg-background shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)] dark:shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.35)]",
        },
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        cell: ({ row }) => {
          const variable = row.original;
          const isRevealed = revealedIds.has(variable.id);

          return (
            <div className="flex justify-end">
              <DataTableRowActions
                label="Variable actions"
                actions={[
                  {
                    label: isRevealed ? "Hide value" : "Reveal value",
                    icon: isRevealed ? (
                      <EyeOff className="me-2 size-4" aria-hidden />
                    ) : (
                      <Eye className="me-2 size-4" aria-hidden />
                    ),
                    disabled: revealingIds?.has(variable.id),
                    onSelect: () => onReveal(variable.id),
                  },
                  {
                    label: "Copy value",
                    icon: <Copy className="me-2 size-4" aria-hidden />,
                    disabled: !isRevealed || !variable.value,
                    onSelect: () => {
                      void navigator.clipboard.writeText(variable.value ?? "");
                      toast.success("Copied to clipboard");
                    },
                  },
                  {
                    label: "Edit",
                    icon: <Pencil className="me-2 size-4" aria-hidden />,
                    onSelect: () => handleEdit(variable),
                  },
                  {
                    label: "Delete",
                    icon: <Trash2 className="me-2 size-4" aria-hidden />,
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
      onReveal,
      revealedIds,
      revealingIds,
      toggleValueExpanded,
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
        emptyState={
          <DataTableEmpty
            icon={Plus}
            title="No variables yet"
            description="Add your first environment variable to get started."
            action={
              <AddVariableSheet
                onConfirm={onAddVariable}
                isPending={isAddingVariable}
              />
            }
          />
        }
        primaryAction={
          variables.length > 0 ? (
            <AddVariableSheet
              onConfirm={onAddVariable}
              isPending={isAddingVariable}
            />
          ) : null
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
          onConfirm={async (data) => {
            const updatedVariable: Variable = {
              ...editVariable,
              key: data.key,
              value: data.value,
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
