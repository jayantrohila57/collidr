"use client";

import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import { Eye, EyeOff, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";
import { CopyButton } from "@/components/patterns/copy-button";
import { EmptyState } from "@/components/patterns/empty-state";
import { IconButton } from "@/components/patterns/icon-button";
import { SecretValue } from "@/components/patterns/secret-value";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import { AddVariableDialog } from "./add-variable-dialog";
import { EditVariableDialog } from "./edit-variable-dialog";
import { VariablesMobileList } from "./variables-mobile-list";

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
  revealedIds: Set<string>;
  revealingIds?: Set<string>;
  onReveal: (id: string) => void;
  onCopy?: (id: string) => void;
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
  const [openActionsMenuId, setOpenActionsMenuId] = useState<string | null>(
    null,
  );

  const releaseOverlayPointerLock = () => {
    document.body.style.pointerEvents = "";
    document.documentElement.style.pointerEvents = "";
  };

  const handleDelete = (variable: Variable) => {
    setOpenActionsMenuId(null);
    setDeleteTarget({ id: variable.id, key: variable.key });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await onDelete(deleteTarget.id);
      setDeleteDialogOpen(false);
    }
  };

  const handleEdit = (variable: Variable) => {
    setOpenActionsMenuId(null);
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
  };

  const toggleValueExpanded = (id: string) => {
    setExpandedValueIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("key", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Key" />
        ),
        cell: ({ getValue }) => (
          <span className="font-medium font-mono">{getValue()}</span>
        ),
      }),
      columnHelper.display({
        id: "value",
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
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        cell: ({ row }) => {
          const variable = row.original;
          const isRevealed = revealedIds.has(variable.id);

          return (
            <div className="flex items-center justify-end gap-1">
              <IconButton
                icon={isRevealed ? EyeOff : Eye}
                label={isRevealed ? "Hide value" : "Reveal value"}
                isLoading={revealingIds?.has(variable.id)}
                onClick={() => onReveal(variable.id)}
              />
              <CopyButton
                value={variable.value ?? ""}
                label="Copy value"
                disabled={!isRevealed || !variable.value}
              />
              <Menu
                open={openActionsMenuId === variable.id}
                onOpenChange={(open) =>
                  setOpenActionsMenuId(open ? variable.id : null)
                }
              >
                <MenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Variable actions"
                    />
                  }
                >
                  <MoreVertical className="size-4" aria-hidden />
                </MenuTrigger>
                <MenuPopup align="end">
                  <MenuItem onClick={() => void handleEdit(variable)}>
                    <Pencil className="me-2 h-4 w-4" />
                    Edit
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem
                    onClick={() => handleDelete(variable)}
                    variant="destructive"
                  >
                    <Trash2 className="me-2 h-4 w-4" />
                    Delete
                  </MenuItem>
                </MenuPopup>
              </Menu>
            </div>
          );
        },
      }),
    ],
    [
      expandedValueIds,
      openActionsMenuId,
      onReveal,
      revealedIds,
      revealingIds,
      handleDelete,
      handleEdit,
      toggleValueExpanded,
    ],
  );

  if (variables.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={Plus}
          title="No variables yet"
          description="Add your first environment variable to get started."
        />
        <div className="flex justify-center">
          <AddVariableDialog
            onConfirm={onAddVariable}
            isPending={isAddingVariable}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <VariablesMobileList
        variables={variables}
        revealedIds={revealedIds}
        revealingIds={revealingIds}
        onReveal={onReveal}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <div className="hidden min-w-0 md:block">
        <DataTable
          columns={columns}
          data={variables}
          caption="Environment variables"
        />
      </div>

      {editVariable && (
        <EditVariableDialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setEditVariable(null);
              setEditLoadingValue(false);
              setOpenActionsMenuId(null);
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
