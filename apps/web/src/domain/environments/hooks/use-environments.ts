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

  const projectQuery = useQuery(
    trpc.projects.getBySlug.queryOptions({ slug: projectSlug }),
  );

  const createEnvMutation = useMutation(
    trpc.environments.create.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
        });

        const previousProjectData = queryClient.getQueryData(
          trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
        ) as ProjectQueryResponse | undefined;

        if (previousProjectData?.data) {
          const newEnvironment: EnvironmentOutput = {
            id: `temp-${Date.now()}`,
            name: variables.name,
            slug:
              variables.slug ||
              variables.name.toLowerCase().replace(/\s+/g, "-"),
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

        return { previousProjectData };
      },
      onError: (error) => {
        toast.error(error.message);
        // Rollback to the previous value
        if (createEnvMutation.context?.previousProjectData) {
          queryClient.setQueryData(
            trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
            createEnvMutation.context.previousProjectData,
          );
        }
      },
      onSettled: () => {
        // Always refetch after error or success to ensure consistency
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
        });
        // Also invalidate projects list to reflect any changes
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
      },
      onSuccess: () => {
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
      onError: (error) => {
        toast.error(error.message);
        // Rollback to previous value
        if (updateEnvMutation.context?.previousProjectData) {
          queryClient.setQueryData(
            trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
            updateEnvMutation.context.previousProjectData,
          );
        }
      },
      onSettled: () => {
        // Always refetch after error or success to ensure consistency
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
        });
        // Also invalidate projects list to reflect any changes
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
      },
      onSuccess: () => {
        toast.success("Environment updated successfully");
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
    projectId: projectData.project?.id,
  };
}
