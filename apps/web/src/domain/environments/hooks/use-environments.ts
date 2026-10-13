"use client";

import type { EnvironmentOutput, ProjectOutput } from "@env-manager/api/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { projectDetailQueryStaleTime } from "@/lib/prefetch-project-detail";
import { toast } from "@/lib/toast";
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

function resolveEnvironmentId(
  environments: EnvironmentOutput[],
  param: string | null,
) {
  if (!param) return undefined;
  const byId = environments.find((env) => env.id === param);
  if (byId) return byId.id;
  const bySlug = environments.find((env) => env.slug === param);
  return bySlug?.id;
}

export function useEnvironments(projectSlug: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const envParam = searchParams.get("env");

  const projectQuery = useQuery({
    ...trpc.projects.getBySlug.queryOptions({ slug: projectSlug }),
    meta: { toastOnError: false },
    staleTime: projectDetailQueryStaleTime,
    gcTime: projectDetailQueryStaleTime * 2,
  });

  const projectData = projectQuery.data?.data ?? {
    project: null,
    environments: [],
  };
  const environments = projectData.environments;

  const urlActiveTab = useMemo(() => {
    const resolved = resolveEnvironmentId(environments, envParam);
    return resolved ?? environments[0]?.id;
  }, [environments, envParam]);

  const [clientActiveTab, setClientActiveTab] = useState<string | undefined>();

  useEffect(() => {
    setClientActiveTab(undefined);
  }, [envParam, projectSlug]);

  const activeTab = clientActiveTab ?? urlActiveTab;

  const setActiveTab = useCallback(
    (id: string) => {
      setClientActiveTab(id);
      const params = new URLSearchParams(searchParams.toString());
      const env = environments.find((item) => item.id === id);
      params.set("env", env?.slug ?? id);
      const query = params.toString();
      const href = query ? `${pathname}?${query}` : pathname;
      window.history.replaceState(window.history.state, "", href);
    },
    [environments, pathname, searchParams],
  );

  const createEnvMutation = useMutation(
    trpc.environments.create.mutationOptions({
      meta: { skipGlobalErrorToast: true },
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
      },
    }),
  );

  const updateEnvMutation = useMutation(
    trpc.environments.update.mutationOptions({
      meta: { skipGlobalErrorToast: true },
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
    }),
  );

  const deleteEnvMutation = useMutation(
    trpc.environments.delete.mutationOptions({
      meta: { skipGlobalErrorToast: true },
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.dashboard.getOverview.queryKey(),
        });
        if (activeTab === variables.id) {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("env");
          const query = params.toString();
          const href = (query ? `${pathname}?${query}` : pathname) as Route;
          router.replace(href, { scroll: false });
        }
      },
    }),
  );

  const isLoading = projectQuery.isLoading && projectData.project === null;
  const status: "loading" | "error" | "success" = isLoading
    ? "loading"
    : projectQuery.isError
      ? "error"
      : "success";

  return {
    project: projectData.project,
    environments,
    status,
    isLoading,
    activeTab,
    setActiveTab,
    createEnvironment: (
      input: Parameters<typeof createEnvMutation.mutateAsync>[0],
    ) =>
      toast.promise(createEnvMutation.mutateAsync(input), {
        loading: "Creating environment…",
        success: "Environment created",
      }),
    isCreating: createEnvMutation.isPending,
    updateEnvironment: (
      input: Parameters<typeof updateEnvMutation.mutateAsync>[0],
    ) =>
      toast.promise(updateEnvMutation.mutateAsync(input), {
        loading: "Saving environment…",
        success: "Environment updated",
      }),
    isUpdating: updateEnvMutation.isPending,
    deleteEnvironment: (
      input: Parameters<typeof deleteEnvMutation.mutateAsync>[0],
    ) =>
      toast.promise(deleteEnvMutation.mutateAsync(input), {
        loading: "Deleting environment…",
        success: "Environment deleted",
      }),
    isDeleting: deleteEnvMutation.isPending,
    projectId: projectData.project?.id,
  };
}
