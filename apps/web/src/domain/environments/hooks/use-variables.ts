"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@/lib/toast";
import { isVariablesV2EnabledOnClient } from "@/lib/variables-v2";
import { trpc } from "@/utils/trpc";

export type VariableOutput = {
  id: string;
  key: string;
  environmentId: string;
  createdAt: string;
  updatedAt: string;
  value?: string;
  type?: "secret" | "config";
  note?: string | null;
  updatedByUser?: {
    id: string;
    name: string;
    image?: string | null;
  } | null;
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
  const v2 = isVariablesV2EnabledOnClient();
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [revealingIds, setRevealingIds] = useState<Set<string>>(new Set());
  const canQuery = isPersistedEnvironmentId(environmentId);

  const variablesQuery = useQuery({
    ...trpc.environmentVariables.list.queryOptions({ environmentId }),
    enabled: canQuery,
    meta: { toastOnError: false },
  });

  const createMutation = useMutation(
    trpc.environmentVariables.create.mutationOptions({
      meta: { skipGlobalErrorToast: true },
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
      onError: (_err, _vars, context) => {
        if (context?.previousVariables) {
          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            context.previousVariables,
          );
        }
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.environmentVariables.update.mutationOptions({
      meta: { skipGlobalErrorToast: true },
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
      onError: (_err, _vars, context) => {
        if (context?.previousVariables) {
          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            context.previousVariables,
          );
        }
      },
      onSuccess: (_result, variables) => {
        if (variables.value !== undefined) {
          queryClient.setQueryData(
            ["revealedValue", variables.id],
            variables.value,
          );
        }
        queryClient.removeQueries({
          queryKey: trpc.environmentVariables.get.queryKey({
            id: variables.id,
          }),
        });
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.environmentVariables.delete.mutationOptions({
      meta: { skipGlobalErrorToast: true },
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
      onError: (_err, _vars, context) => {
        if (context?.previousVariables) {
          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            context.previousVariables,
          );
        }
      },
    }),
  );

  const batchCreateMutation = useMutation(
    trpc.environmentVariables.batchCreate.mutationOptions({
      meta: { skipGlobalErrorToast: true },
      onSuccess: async (_result, input) => {
        await Promise.all(
          input.environmentIds.map((envId) =>
            queryClient.invalidateQueries({
              queryKey: trpc.environmentVariables.list.queryKey({
                environmentId: envId,
              }),
            }),
          ),
        );
      },
    }),
  );

  const bulkImportMutation = useMutation(
    trpc.environmentVariables.bulkImport.mutationOptions({
      meta: { skipGlobalErrorToast: true },
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
      onError: (_err, _vars, context) => {
        if (context?.previousVariables) {
          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            context.previousVariables,
          );
        }
      },
    }),
  );

  const isSecretVariable = (varId: string) => {
    const row = variablesQuery.data?.data?.find((v) => v.id === varId);
    return v2 && (row?.type ?? "secret") === "secret";
  };

  const toggleReveal = async (varId: string) => {
    if (isSecretVariable(varId)) {
      toast.error("Secret values stay hidden after save. Edit to overwrite.");
      return;
    }

    if (revealedIds.has(varId)) {
      setRevealedIds((prev) => {
        const next = new Set(prev);
        next.delete(varId);
        return next;
      });
      queryClient.removeQueries({ queryKey: ["revealedValue", varId] });
      return;
    }

    setRevealingIds((prev) => new Set(prev).add(varId));
    try {
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
    } finally {
      setRevealingIds((prev) => {
        const next = new Set(prev);
        next.delete(varId);
        return next;
      });
    }
  };

  const getRevealedValue = (varId: string) =>
    queryClient.getQueryData<string>(["revealedValue", varId]);

  const fetchVariableValue = async (
    varId: string,
    options?: { force?: boolean },
  ) => {
    if (isSecretVariable(varId)) {
      return "";
    }

    if (!options?.force) {
      const cached = queryClient.getQueryData<string>(["revealedValue", varId]);
      if (cached !== undefined) {
        return cached;
      }
    } else {
      queryClient.removeQueries({
        queryKey: trpc.environmentVariables.get.queryKey({ id: varId }),
      });
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
    revealingIds,
    toggleReveal,
    createVariable: (input: Parameters<typeof createMutation.mutateAsync>[0]) =>
      toast.promise(createMutation.mutateAsync(input), {
        loading: "Adding variable…",
        success: "Variable added",
      }),
    isCreating: createMutation.isPending,
    updateVariable: (input: Parameters<typeof updateMutation.mutateAsync>[0]) =>
      toast.promise(updateMutation.mutateAsync(input), {
        loading: "Saving variable…",
        success: "Variable updated",
      }),
    isUpdating: updateMutation.isPending,
    deleteVariable: (input: Parameters<typeof deleteMutation.mutateAsync>[0]) =>
      toast.promise(deleteMutation.mutateAsync(input), {
        loading: "Deleting variable…",
        success: "Variable deleted",
      }),
    isDeleting: deleteMutation.isPending,
    bulkImport: (input: Parameters<typeof bulkImportMutation.mutateAsync>[0]) =>
      toast.promise(bulkImportMutation.mutateAsync(input), {
        loading: "Importing variables…",
        success: "Variables imported",
      }),
    isImporting: bulkImportMutation.isPending,
    batchCreateVariables: (
      input: Parameters<typeof batchCreateMutation.mutateAsync>[0],
    ) =>
      toast.promise(batchCreateMutation.mutateAsync(input), {
        loading: "Saving variables…",
        success: "Variables saved",
      }),
    isBatchCreating: batchCreateMutation.isPending,
    variablesV2Enabled: v2,
    getRevealedValue,
    fetchVariableValue,
  };
}
