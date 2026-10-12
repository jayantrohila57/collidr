"use client";

import { toast } from "sonner";
import { useVariables } from "../hooks/use-variables";
import { AddVariableDialog } from "./add-variable-dialog";
import { VariablesSkeleton } from "./skeletons";
import { VariablesTableView } from "./variables-table-view";

interface Variable {
  id: string;
  key: string;
  environmentId: string;
  createdAt: string;
  updatedAt: string;
  value?: string;
}

export function EnvironmentPanel({ environmentId }: { environmentId: string }) {
  const {
    variables,
    status,
    revealedIds,
    toggleReveal,
    createVariable,
    isCreating,
    updateVariable,
    isUpdating,
    deleteVariable,
    getRevealedValue,
  } = useVariables(environmentId);

  const variablesWithValues = variables.map((variable) => ({
    ...variable,
    value: getRevealedValue(variable.id),
  }));

  const handleCreate = async (data: { key: string; value: string }) => {
    await createVariable({ environmentId, ...data });
  };

  const handleCopy = async (id: string) => {
    try {
      let value = getRevealedValue(id);
      if (!value) {
        await toggleReveal(id);
        value = getRevealedValue(id);
      }
      const variable = variablesWithValues.find((v) => v.id === id);
      const text = value ?? variable?.value;
      if (!text) {
        toast.error("Reveal the value before copying.");
        return;
      }
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy value");
    }
  };

  const handleEdit = async (variable: Variable) => {
    await updateVariable({
      id: variable.id,
      key: variable.key,
      value: variable.value ?? "",
    });
  };

  const handleDelete = async (id: string) => {
    await deleteVariable({ id });
  };

  if (status === "loading") return <VariablesSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Variables</h3>
        <AddVariableDialog onConfirm={handleCreate} isPending={isCreating} />
      </div>

      <VariablesTableView
        variables={variablesWithValues}
        revealedIds={revealedIds}
        onReveal={toggleReveal}
        onCopy={handleCopy}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddVariable={handleCreate}
        isAddingVariable={isCreating}
        isUpdating={isUpdating}
      />
    </div>
  );
}
