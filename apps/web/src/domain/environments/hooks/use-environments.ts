"use client";

import type { EnvironmentOutput, ProjectOutput } from "@env-manager/api/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

interface ProjectData {
  project: ProjectOutput | null;
  environments: EnvironmentOutput[];
}

interface ProjectQueryResponse {
  status: "success";
  message: string;
  data: ProjectData;
  error: string | null;
}

export function useEnvironments(projectSlug: string) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string | undefined>();

  const projectQuery = useQuery({
    ...trpc.projects.getBySlug.queryOptions({ slug: projectSlug }),
    meta: { toastOnError: false },
  });

  const createEnvMutation = useMutation(
    trpc.environments.create.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
        });

        const previousProjectData = queryClient.getQueryData(
          trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
        ) as ProjectQueryResponse | undefined;

        const optimisticId = crypto.randomUUID();

        if (previousProjectData?.data) {
          const newEnvironment: EnvironmentOutput = {
            id: optimisticId,
            name: variables.name,
            slug: variables.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, ""),
            projectId: previousProjectData.data.project?.id || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            branch: null,
            deployedUrl: null,
            status: "active" as const,
            isProduction: false,
            description: null,
          };

          queryClient.setQueryData(
            trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
            {
              ...previousProjectData,
              data: {
                ...previousProjectData.data,
                environments: [
                  ...previousProjectData.data.environments,
                  newEnvironment,
                ],
              },
            },
          );
        }

        return { previousProjectData, optimisticId };
      },
      onError: () => {
        if (createEnvMutation.context?.previousProjectData) {
          queryClient.setQueryData(
            trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
            createEnvMutation.context.previousProjectData,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.dashboard.getOverview.queryKey(),
        });
      },
      onSuccess: (response) => {
        const newId = response.data?.id;
        if (newId) {
          setActiveTab(newId);
        }
        toast.success("Environment created successfully");
      },
    }),
  );

  const updateEnvMutation = useMutation(
    trpc.environments.update.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
        });

        const previousProjectData = queryClient.getQueryData(
          trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
        ) as ProjectQueryResponse | undefined;

        if (previousProjectData?.data) {
          queryClient.setQueryData(
            trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
            {
              ...previousProjectData,
              data: {
                ...previousProjectData.data,
                environments: previousProjectData.data.environments.map(
                  (env) =>
                    env.id === variables.id
                      ? {
                          ...env,
                          ...(variables.name && { name: variables.name }),
                          updatedAt: new Date().toISOString(),
                        }
                      : env,
                ),
              },
            },
          );
        }

        return { previousProjectData };
      },
      onError: () => {
        if (updateEnvMutation.context?.previousProjectData) {
          queryClient.setQueryData(
            trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
            updateEnvMutation.context.previousProjectData,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
      },
      onSuccess: () => {
        toast.success("Environment updated successfully");
      },
    }),
  );

  const deleteEnvMutation = useMutation(
    trpc.environments.delete.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.dashboard.getOverview.queryKey(),
        });
        setActiveTab((current) =>
          current === variables.id ? undefined : current,
        );
        toast.success("Environment deleted");
      },
    }),
  );

  const status: "loading" | "error" | "success" = projectQuery.isLoading
    ? "loading"
    : projectQuery.isError
      ? "error"
      : "success";

  const projectData = projectQuery.data?.data ?? {
    project: null,
    environments: [],
  };
  const currentTab = activeTab ?? projectData.environments[0]?.id;

  return {
    project: projectData.project,
    environments: projectData.environments,
    status,
    activeTab: currentTab,
    setActiveTab,
    createEnvironment: createEnvMutation.mutateAsync,
    isCreating: createEnvMutation.isPending,
    updateEnvironment: updateEnvMutation.mutateAsync,
    isUpdating: updateEnvMutation.isPending,
    deleteEnvironment: deleteEnvMutation.mutateAsync,
    isDeleting: deleteEnvMutation.isPending,
    projectId: projectData.project?.id,
  };
}
