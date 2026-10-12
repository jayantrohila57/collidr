"use client";

import { ErrorState } from "@/components/patterns/error-state";
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
    fetchVariableValue,
  } = useVariables(environmentId);

  const variablesWithValues = variables.map((variable) => ({
    ...variable,
    value: getRevealedValue(variable.id),
  }));

  const handleCreate = async (data: { key: string; value: string }) => {
    await createVariable({ environmentId, ...data });
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

  if (status === "error") {
    return (
      <ErrorState
        title="Failed to load variables"
        description="We could not load environment variables."
        onRetry={() => window.location.reload()}
      />
    );
  }

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
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddVariable={handleCreate}
        onFetchValue={fetchVariableValue}
        isAddingVariable={isCreating}
        isUpdating={isUpdating}
      />
    </div>
  );
}
