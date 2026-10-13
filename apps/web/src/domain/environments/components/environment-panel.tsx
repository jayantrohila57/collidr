"use client";

import type { EnvironmentOutput } from "@env-manager/api/types";
import { ErrorState } from "@/components/patterns/error-state";
import { useVariables } from "../hooks/use-variables";
import { AddVariableSheetV2 } from "./add-variable-sheet-v2";
import { VariablesTableView } from "./variables-table-view";

interface EnvironmentPanelProps {
  environmentId: string;
  projectId: string;
  environments: EnvironmentOutput[];
}

export function EnvironmentPanel({
  environmentId,
  projectId,
  environments,
}: EnvironmentPanelProps) {
  const {
    variables,
    status,
    revealedIds,
    revealingIds,
    toggleReveal,
    createVariable,
    batchCreateVariables,
    isCreating,
    isBatchCreating,
    updateVariable,
    isUpdating,
    deleteVariable,
    getRevealedValue,
    fetchVariableValue,
    variablesV2Enabled,
  } = useVariables(environmentId);

  const variablesWithValues = variables.map((variable) => ({
    ...variable,
    value: getRevealedValue(variable.id),
  }));

  const handleCreate = async (data: { key: string; value: string }) => {
    await createVariable({ environmentId, ...data });
  };

  const handleBatchCreate = async (data: {
    environmentIds: string[];
    variables: Array<{
      key: string;
      value: string;
      note?: string;
      type: "secret" | "config";
    }>;
  }) => {
    await batchCreateVariables({
      projectId,
      environmentIds: data.environmentIds,
      variables: data.variables,
    });
  };

  const handleEdit = async (variable: {
    id: string;
    key: string;
    value?: string;
    note?: string | null;
    type?: "secret" | "config";
  }) => {
    const payload: {
      id: string;
      key: string;
      value?: string;
      note?: string | null;
      type?: "secret" | "config";
    } = {
      id: variable.id,
      key: variable.key,
      note: variable.note,
      type: variable.type,
    };
    if (variable.value?.trim()) {
      payload.value = variable.value;
    }
    await updateVariable(payload);
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

  const addSheet = variablesV2Enabled ? (
    <AddVariableSheetV2
      projectId={projectId}
      environments={environments.map((env) => ({
        id: env.id,
        name: env.name,
      }))}
      defaultEnvironmentId={environmentId}
      onConfirm={handleBatchCreate}
      isPending={isBatchCreating}
      triggerLayout="tableEmpty"
    />
  ) : undefined;

  const primaryAddSheet = variablesV2Enabled ? (
    <AddVariableSheetV2
      projectId={projectId}
      environments={environments.map((env) => ({
        id: env.id,
        name: env.name,
      }))}
      defaultEnvironmentId={environmentId}
      onConfirm={handleBatchCreate}
      isPending={isBatchCreating}
      triggerLayout="toolbar"
    />
  ) : undefined;

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
      onFetchValue={fetchVariableValue}
      isAddingVariable={isCreating}
      isUpdating={isUpdating}
      variablesV2Enabled={variablesV2Enabled}
      addSheetEmpty={addSheet}
      addSheetToolbar={primaryAddSheet}
    />
  );
}
