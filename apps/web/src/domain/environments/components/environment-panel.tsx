"use client";

import { ErrorState } from "@/components/patterns/error-state";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { useVariables } from "../hooks/use-variables";
import { AddVariableSheet } from "./add-variable-sheet";
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
      <Card>
        <CardHeader>
          <CardTitle>Variables</CardTitle>
          <CardDescription>
            Secrets and configuration for this environment.
          </CardDescription>
        </CardHeader>
        <CardPanel className="pt-0">
          <VariablesSkeleton />
        </CardPanel>
      </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Variables</CardTitle>
        <CardDescription>
          Secrets and configuration for this environment.
        </CardDescription>
        <CardAction>
          <AddVariableSheet onConfirm={handleCreate} isPending={isCreating} />
        </CardAction>
      </CardHeader>
      <CardPanel className="min-w-0 pt-0">
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
      </CardPanel>
    </Card>
  );
}
