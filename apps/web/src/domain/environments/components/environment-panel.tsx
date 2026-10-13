"use client";

import { ErrorState } from "@/components/patterns/error-state";
import {
  CardFrame,
  CardFrameAction,
  CardFrameHeader,
  CardFrameTitle,
} from "@/components/ui/card";
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
    revealingIds,
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

  if (status === "loading") {
    return (
      <CardFrame>
        <CardFrameHeader>
          <CardFrameTitle>Variables</CardFrameTitle>
          <CardFrameAction>
            <div className="h-7 w-28 shrink-0" aria-hidden />
          </CardFrameAction>
        </CardFrameHeader>
        <VariablesSkeleton />
      </CardFrame>
    );
  }

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
    <CardFrame>
      <CardFrameHeader>
        <CardFrameTitle>Variables</CardFrameTitle>
        <CardFrameAction>
          <AddVariableDialog onConfirm={handleCreate} isPending={isCreating} />
        </CardFrameAction>
      </CardFrameHeader>
      <VariablesTableView
        variables={variablesWithValues}
        revealedIds={revealedIds}
        revealingIds={revealingIds}
        onReveal={toggleReveal}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddVariable={handleCreate}
        onFetchValue={fetchVariableValue}
        isAddingVariable={isCreating}
        isUpdating={isUpdating}
      />
    </CardFrame>
  );
}
