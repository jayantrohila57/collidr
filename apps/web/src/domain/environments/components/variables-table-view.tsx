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
  onReveal: (id: string) => void;
  onCopy?: (id: string) => void;
  onEdit: (variable: Variable) => void;
  onDelete: (id: string) => void;
  onAddVariable: (data: { key: string; value: string }) => Promise<void>;
  isAddingVariable: boolean;
  isUpdating?: boolean;
}

export function VariablesTableView({
  variables,
  revealedIds,
  onReveal,
  onEdit,
  onDelete,
  onAddVariable,
  isAddingVariable,
  isUpdating = false,
}: VariablesTableViewProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<Variable | null>(null);

  const handleDelete = (variable: Variable) => {
    setDeleteDialogOpen(variable.id);
  };

  const confirmDelete = async () => {
    if (deleteDialogOpen) {
      onDelete(deleteDialogOpen);
      setDeleteDialogOpen(null);
    }
  };

  const handleEdit = (variable: Variable) => {
    setEditDialogOpen(variable);
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
      <Table className="rounded-lg border">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">Key</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variables.map((variable) => (
            <TableRow key={variable.id}>
              <TableCell className="font-medium font-mono">
                {variable.key}
              </TableCell>
              <TableCell>
                <SecretValue
                  revealed={revealedIds.has(variable.id)}
                  value={variable.value}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <IconButton
                    icon={revealedIds.has(variable.id) ? EyeOff : Eye}
                    label={
                      revealedIds.has(variable.id)
                        ? "Hide value"
                        : "Reveal value"
                    }
                    onClick={() => onReveal(variable.id)}
                  />
                  <CopyButton
                    value={variable.value ?? ""}
                    label="Copy value"
                    disabled={!revealedIds.has(variable.id) || !variable.value}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label="Variable actions"
                      >
                        <MoreVertical className="size-4" aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(variable)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(variable)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      {editDialogOpen && (
        <EditVariableDialog
          variable={{
            id: editDialogOpen.id,
            key: editDialogOpen.key,
            value: editDialogOpen.value || "",
          }}
          onConfirm={async (data) => {
            const updatedVariable: Variable = {
              ...editDialogOpen,
              key: data.key,
              value: data.value,
            };
            await onEdit(updatedVariable);
            setEditDialogOpen(null);
          }}
          isPending={isUpdating}
        />
      )}

      {/* Delete Confirmation Dialog */}
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
