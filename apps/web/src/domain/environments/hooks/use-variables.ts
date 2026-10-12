"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

type VariableOutput = {
  id: string;
  key: string;
  environmentId: string;
  createdAt: string;
  updatedAt: string;
  value?: string;
};

interface VariablesQueryResponse {
  status: "success";
  message: string;
  data: VariableOutput[];
  error: string | null;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isPersistedEnvironmentId(environmentId: string) {
  return UUID_RE.test(environmentId);
}

export function useVariables(environmentId: string) {
  const queryClient = useQueryClient();
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const canQuery = isPersistedEnvironmentId(environmentId);

  const variablesQuery = useQuery({
    ...trpc.environmentVariables.list.queryOptions({ environmentId }),
    enabled: canQuery,
    meta: { toastOnError: false },
  });

  const createMutation = useMutation(
    trpc.environmentVariables.create.mutationOptions({
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: trpc.environmentVariables.list.queryKey({ environmentId }),
        });

        // Snapshot the previous value
        const previousVariables = queryClient.getQueryData(
          trpc.environmentVariables.list.queryKey({ environmentId }),
        ) as VariablesQueryResponse | undefined;

        // Optimistically add the new variable
        if (previousVariables?.data) {
          const newVariable: VariableOutput = {
            id: `temp-${Date.now()}`,
            key: variables.key,
            value: variables.value,
            environmentId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            {
              ...previousVariables,
              data: [...previousVariables.data, newVariable],
            },
          );
        }

        return { previousVariables };
      },
      onError: () => {
        // Rollback to the previous value
        if (createMutation.context?.previousVariables) {
          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            createMutation.context.previousVariables,
          );
        }
      },
      onSettled: () => {
        // Always refetch after error or success to ensure consistency
        queryClient.invalidateQueries({
          queryKey: trpc.environmentVariables.list.queryKey({ environmentId }),
        });
      },
      onSuccess: () => {
        toast.success("Variable added", {
          id: `variable-create-${environmentId}`,
        });
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.environmentVariables.update.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.environmentVariables.list.queryKey({ environmentId }),
        });

        const previousVariables = queryClient.getQueryData(
          trpc.environmentVariables.list.queryKey({ environmentId }),
        ) as VariablesQueryResponse | undefined;

        // Optimistically update the variable
        if (previousVariables?.data) {
          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            {
              ...previousVariables,
              data: previousVariables.data.map((variable: VariableOutput) =>
                variable.id === variables.id
                  ? {
                      ...variable,
                      ...variables,
                      updatedAt: new Date().toISOString(),
                    }
                  : variable,
              ),
            },
          );
        }

        return { previousVariables };
      },
      onError: () => {
        if (updateMutation.context?.previousVariables) {
          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            updateMutation.context.previousVariables,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.environmentVariables.list.queryKey({ environmentId }),
        });
      },
      onSuccess: () => {
        toast.success("Variable updated successfully");
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.environmentVariables.delete.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.environmentVariables.list.queryKey({ environmentId }),
        });

        const previousVariables = queryClient.getQueryData(
          trpc.environmentVariables.list.queryKey({ environmentId }),
        ) as VariablesQueryResponse | undefined;

        // Optimistically remove the variable
        if (previousVariables?.data) {
          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            {
              ...previousVariables,
              data: previousVariables.data.filter(
                (variable: VariableOutput) => variable.id !== variables.id,
              ),
            },
          );
        }

        return { previousVariables };
      },
      onError: () => {
        if (deleteMutation.context?.previousVariables) {
          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            deleteMutation.context.previousVariables,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.environmentVariables.list.queryKey({ environmentId }),
        });
      },
      onSuccess: () => {
        toast.success("Variable deleted", {
          id: `variable-delete-${environmentId}`,
        });
      },
    }),
  );

  const bulkImportMutation = useMutation(
    trpc.environmentVariables.bulkImport.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.environmentVariables.list.queryKey({ environmentId }),
        });

        const previousVariables = queryClient.getQueryData(
          trpc.environmentVariables.list.queryKey({ environmentId }),
        ) as VariablesQueryResponse | undefined;

        // Optimistically add the new variables
        if (previousVariables?.data) {
          const newVariables: VariableOutput[] = variables.variables.map(
            (variable, index) => ({
              id: `temp-bulk-${Date.now()}-${index}`,
              key: variable.key,
              value: variable.value,
              environmentId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
          );

          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            {
              ...previousVariables,
              data: [...previousVariables.data, ...newVariables],
            },
          );
        }

        return { previousVariables };
      },
      onError: () => {
        if (bulkImportMutation.context?.previousVariables) {
          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            bulkImportMutation.context.previousVariables,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.environmentVariables.list.queryKey({ environmentId }),
        });
      },
      onSuccess: (data) => {
        toast.success(data.message);
      },
    }),
  );

  const toggleReveal = async (varId: string) => {
    if (revealedIds.has(varId)) {
      setRevealedIds((prev) => {
        const next = new Set(prev);
        next.delete(varId);
        return next;
      });
      queryClient.removeQueries({ queryKey: ["revealedValue", varId] });
      return;
    }

    const result = await queryClient.fetchQuery(
      trpc.environmentVariables.get.queryOptions({ id: varId }),
    );
    if (result?.data) {
      setRevealedIds((prev) => new Set(prev).add(varId));
      queryClient.setQueryData(["revealedValue", varId], result.data.value);
      queryClient.setQueryData(
        trpc.environmentVariables.list.queryKey({ environmentId }),
        (old: VariablesQueryResponse | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((variable) =>
              variable.id === varId
                ? { ...variable, value: result.data?.value }
                : variable,
            ),
          };
        },
      );
    }
  };

  const getRevealedValue = (varId: string) =>
    queryClient.getQueryData<string>(["revealedValue", varId]);

  const fetchVariableValue = async (varId: string) => {
    const cached = queryClient.getQueryData<string>(["revealedValue", varId]);
    if (cached !== undefined) {
      return cached;
    }

    const result = await queryClient.fetchQuery(
      trpc.environmentVariables.get.queryOptions({ id: varId }),
    );
    const value = result.data?.value ?? "";
    queryClient.setQueryData(["revealedValue", varId], value);
    return value;
  };

  const status: "loading" | "error" | "empty" | "success" =
    variablesQuery.isLoading
      ? "loading"
      : variablesQuery.isError
        ? "error"
        : variablesQuery.data?.data.length === 0
          ? "empty"
          : "success";

  return {
    variables: variablesQuery.data?.data ?? [],
    status,
    revealedIds,
    toggleReveal,
    createVariable: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateVariable: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteVariable: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    bulkImport: bulkImportMutation.mutateAsync,
    isImporting: bulkImportMutation.isPending,
    getRevealedValue,
    fetchVariableValue,
  };
}
