"use client";

import { ErrorState } from "@/components/patterns/error-state";
import { useVariables } from "../hooks/use-variables";
import { VariablesTableView } from "./variables-table-view";

interface Variable {
  id: string;
  key: string;
  environmentId: string;
  createdAt: Date;
  updatedAt: Date;
  value?: string;
  type?: "secret" | "config";
  note?: string | null;
  createdBy?: { id: string; name: string; image: string | null } | null;
  updatedBy?: { id: string; name: string; image: string | null } | null;
}

interface EnvironmentPanelProps {
  environmentId: string;
  projectEnvironments?: { id: string; name: string }[];
}

export function EnvironmentPanel({
  environmentId,
  projectEnvironments = [],
}: EnvironmentPanelProps) {
  const {
    variables,
    status,
    revealedIds,
    revealingIds,
    toggleReveal,
    createVariable,
    createVariablesBatch,
    isCreating,
    updateVariable,
    isUpdating,
    deleteVariable,
    getRevealedValue,
    fetchVariableValue,
  } = useVariables(environmentId);

  const variablesWithValues = variables.map((variable) => ({
    ...variable,
    value:
      variable.type === "config" && variable.value !== undefined
        ? variable.value
        : getRevealedValue(variable.id),
  }));

  const handleCreate = async (data: { key: string; value: string }) => {
    await createVariable({ environmentId, ...data });
  };

  const handleCreateBatch = async (data: {
    environmentIds: string[];
    variables: Array<{
      key: string;
      value: string;
      type: "secret" | "config";
      note?: string;
    }>;
  }) => {
    await createVariablesBatch(data);
  };

  const handleEdit = async (variable: Variable) => {
    await updateVariable({
      id: variable.id,
      key: variable.key,
      value: variable.value ?? "",
      type: variable.type,
      note: variable.note ?? null,
    });
  };

  const handleDelete = async (id: string) => {
    await deleteVariable({ id });
  };

  if (status === "error") {
    return (
      <ErrorState
        title="Failed to load variables"
        description="We could not load environment variables."
        onRetry={() => window.location.reload()}
      />
    );
  }

  const isLoading = status === "loading" && variables.length === 0;

  return (
    <VariablesTableView
      variables={variablesWithValues}
      isLoading={isLoading}
      revealedIds={revealedIds}
      revealingIds={revealingIds}
      onReveal={toggleReveal}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAddVariable={handleCreate}
      onAddVariablesBatch={handleCreateBatch}
      projectEnvironments={projectEnvironments}
      activeEnvironmentId={environmentId}
      onFetchValue={fetchVariableValue}
      isAddingVariable={isCreating}
      isUpdating={isUpdating}
    />
  );
}
