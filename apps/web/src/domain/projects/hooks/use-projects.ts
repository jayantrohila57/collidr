"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

// Interface for API response before transformation
interface ApiProject {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "active" | "inactive" | "maintenance";
  isArchived: boolean;
  isPublic: boolean;
  repositoryUrl: string | null;
  websiteUrl: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectsQueryResponse {
  status: "success";
  message: string;
  data: ApiProject[];
  error: string | null;
}

// Helper function to transform API response to proper ProjectOutput type
function transformProject(project: ApiProject): ProjectOutput {
  return {
    ...project,
    status: project.status as "active" | "inactive" | "maintenance",
  };
}

export function useProjects() {
  const queryClient = useQueryClient();
  const projectsQuery = useQuery({
    ...trpc.projects.list.queryOptions(),
    meta: { toastOnError: false },
  });

  const createMutation = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (data) => {
        // Optimistically update the cache with the new project
        queryClient.setQueryData(
          trpc.projects.list.queryKey(),
          (old: ProjectsQueryResponse | undefined) => {
            if (!old) return old;
            return {
              ...old,
              data: [...old.data, transformProject(data.data)],
            };
          },
        );

        // Invalidate related queries to ensure consistency
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.dashboard.getStats.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.dashboard.getRecentActivity.queryKey(),
        });

        toast.success("Project created successfully");
      },
      onError: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.projects.update.mutationOptions({
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: trpc.projects.list.queryKey(),
        });

        // Snapshot the previous value
        const previousProjects = queryClient.getQueryData(
          trpc.projects.list.queryKey(),
        ) as ProjectsQueryResponse | undefined;

        // Optimistically update to the new value
        queryClient.setQueryData(
          trpc.projects.list.queryKey(),
          (old: ProjectsQueryResponse | undefined) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.map((project) =>
                project.id === variables.id
                  ? { ...project, ...variables }
                  : project,
              ),
            };
          },
        );

        return { previousProjects };
      },
      onError: () => {
        // Rollback to the previous value
        if (updateMutation.context?.previousProjects) {
          queryClient.setQueryData(
            trpc.projects.list.queryKey(),
            updateMutation.context.previousProjects,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === "projects" &&
            Array.isArray(query.queryKey[1]) &&
            query.queryKey[1][0] === "getBySlug",
        });
        queryClient.invalidateQueries({
          queryKey: trpc.dashboard.getStats.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.dashboard.getRecentActivity.queryKey(),
        });
      },
      onSuccess: () => {
        toast.success("Project updated successfully");
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.projects.delete.mutationOptions({
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: trpc.projects.list.queryKey(),
        });

        // Snapshot the previous value
        const previousProjects = queryClient.getQueryData(
          trpc.projects.list.queryKey(),
        ) as ProjectsQueryResponse | undefined;

        // Optimistically remove the deleted project
        queryClient.setQueryData(
          trpc.projects.list.queryKey(),
          (old: ProjectsQueryResponse | undefined) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.filter((project) => project.id !== variables.id),
            };
          },
        );

        return { previousProjects };
      },
      onError: () => {
        // Rollback to the previous value
        if (deleteMutation.context?.previousProjects) {
          queryClient.setQueryData(
            trpc.projects.list.queryKey(),
            deleteMutation.context.previousProjects,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.dashboard.getStats.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.dashboard.getRecentActivity.queryKey(),
        });
      },
      onSuccess: () => {
        toast.success("Project deleted successfully");
      },
    }),
  );

  const archiveMutation = useMutation(
    trpc.projects.archive.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.projects.list.queryKey(),
        });

        const previousProjects = queryClient.getQueryData(
          trpc.projects.list.queryKey(),
        ) as ProjectsQueryResponse | undefined;

        queryClient.setQueryData(
          trpc.projects.list.queryKey(),
          (old: ProjectsQueryResponse | undefined) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: old.data.map((project: ApiProject) =>
                project.id === variables.id
                  ? { ...project, isArchived: true }
                  : project,
              ),
            };
          },
        );

        return { previousProjects };
      },
      onError: () => {
        if (archiveMutation.context?.previousProjects) {
          queryClient.setQueryData(
            trpc.projects.list.queryKey(),
            archiveMutation.context.previousProjects,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
      },
      onSuccess: () => {
        toast.success("Project archived successfully");
      },
    }),
  );

  const unarchiveMutation = useMutation(
    trpc.projects.unarchive.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.projects.list.queryKey(),
        });

        const previousProjects = queryClient.getQueryData(
          trpc.projects.list.queryKey(),
        ) as ProjectsQueryResponse | undefined;

        queryClient.setQueryData(
          trpc.projects.list.queryKey(),
          (old: ProjectsQueryResponse | undefined) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: old.data.map((project: ApiProject) =>
                project.id === variables.id
                  ? { ...project, isArchived: false }
                  : project,
              ),
            };
          },
        );

        return { previousProjects };
      },
      onError: () => {
        if (unarchiveMutation.context?.previousProjects) {
          queryClient.setQueryData(
            trpc.projects.list.queryKey(),
            unarchiveMutation.context.previousProjects,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
      },
      onSuccess: () => {
        toast.success("Project unarchived successfully");
      },
    }),
  );

  const changeStatusMutation = useMutation(
    trpc.projects.changeStatus.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.projects.list.queryKey(),
        });

        const previousProjects = queryClient.getQueryData(
          trpc.projects.list.queryKey(),
        ) as ProjectsQueryResponse | undefined;

        queryClient.setQueryData(
          trpc.projects.list.queryKey(),
          (old: ProjectsQueryResponse | undefined) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: old.data.map((project: ApiProject) =>
                project.id === variables.id
                  ? { ...project, status: variables.status }
                  : project,
              ),
            };
          },
        );

        return { previousProjects };
      },
      onError: () => {
        if (changeStatusMutation.context?.previousProjects) {
          queryClient.setQueryData(
            trpc.projects.list.queryKey(),
            changeStatusMutation.context.previousProjects,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
      },
      onSuccess: () => {
        toast.success("Project status updated successfully");
      },
    }),
  );

  const togglePublicMutation = useMutation(
    trpc.projects.togglePublic.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.projects.list.queryKey(),
        });

        const previousProjects = queryClient.getQueryData(
          trpc.projects.list.queryKey(),
        ) as ProjectsQueryResponse | undefined;

        // Optimistically update the public status
        queryClient.setQueryData(
          trpc.projects.list.queryKey(),
          (old: ProjectsQueryResponse | undefined) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: old.data.map((project: ApiProject) =>
                project.id === variables.id
                  ? { ...project, isPublic: !project.isPublic }
                  : project,
              ),
            };
          },
        );

        return { previousProjects };
      },
      onError: () => {
        if (togglePublicMutation.context?.previousProjects) {
          queryClient.setQueryData(
            trpc.projects.list.queryKey(),
            togglePublicMutation.context.previousProjects,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
      },
      onSuccess: (data) => {
        toast.success(data.message);
      },
    }),
  );

  const status: "loading" | "error" | "empty" | "success" =
    projectsQuery.isLoading
      ? "loading"
      : projectsQuery.isError
        ? "error"
        : projectsQuery.data?.data.length === 0
          ? "empty"
          : "success";

  return {
    projects: (projectsQuery.data?.data ?? []).map(transformProject),
    status,
    error: projectsQuery.error,
    createProject: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProject: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteProject: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    archiveProject: archiveMutation.mutateAsync,
    isArchiving: archiveMutation.isPending,
    unarchiveProject: unarchiveMutation.mutateAsync,
    isUnarchiving: unarchiveMutation.isPending,
    changeProjectStatus: changeStatusMutation.mutateAsync,
    isChangingStatus: changeStatusMutation.isPending,
    toggleProjectPublic: togglePublicMutation.mutateAsync,
    isTogglingPublic: togglePublicMutation.isPending,
  };
}
