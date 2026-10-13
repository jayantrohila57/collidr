"use client";

import { Eye, EyeOff, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";
import { CopyButton } from "@/components/patterns/copy-button";
import { EmptyState } from "@/components/patterns/empty-state";
import { IconButton } from "@/components/patterns/icon-button";
import { SecretValue } from "@/components/patterns/secret-value";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
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
    setDeleteDialogOpen(variable.id);
  };

  const confirmDelete = async () => {
    if (deleteDialogOpen) {
      await onDelete(deleteDialogOpen);
      setDeleteDialogOpen(null);
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
      <div className="hidden min-w-0 overflow-x-auto md:block">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3 text-muted-foreground">Key</TableHead>
              <TableHead className="w-1/2 text-muted-foreground">
                Value
              </TableHead>
              <TableHead className="w-1/6 text-end text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variables.map((variable) => {
              const isRevealed = revealedIds.has(variable.id);
              const isValueExpanded = expandedValueIds.has(variable.id);
              const showExpand =
                isRevealed &&
                Boolean(variable.value && variable.value.length > 80);

              return (
                <TableRow key={variable.id}>
                  <TableCell className="wrap-anywhere align-top font-medium font-mono">
                    {variable.key}
                  </TableCell>
                  <TableCell className="max-w-0 align-top">
                    <SecretValue
                      revealed={isRevealed}
                      value={variable.value}
                      expanded={isValueExpanded}
                    />
                    {showExpand && (
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs"
                        onClick={() => toggleValueExpanded(variable.id)}
                      >
                        {isValueExpanded ? "Collapse" : "Expand"}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-end align-top">
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
                      <DropdownMenu
                        modal={false}
                        open={openActionsMenuId === variable.id}
                        onOpenChange={(open) =>
                          setOpenActionsMenuId(open ? variable.id : null)
                        }
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-11"
                            aria-label="Variable actions"
                          >
                            <MoreVertical className="size-4" aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              void handleEdit(variable);
                            }}
                          >
                            <Pencil className="me-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              handleDelete(variable);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="me-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
        open={Boolean(deleteDialogOpen)}
        onOpenChange={(open) => !open && setDeleteDialogOpen(null)}
        title="Delete variable"
        description={`Delete "${
          variables.find((v) => v.id === deleteDialogOpen)?.key ??
          "this variable"
        }"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
}
