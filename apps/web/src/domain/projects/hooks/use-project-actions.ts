"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { useProjects } from "./use-projects";

interface UseProjectActionsProps {
  projectId: string;
  onUpdate?: () => void;
  enabled?: boolean;
}

export function useProjectActions({
  projectId,
  onUpdate,
  enabled = true,
}: UseProjectActionsProps) {
  const router = useRouter();

  const {
    archiveProject,
    unarchiveProject,
    changeProjectStatus,
    toggleProjectPublic,
    deleteProject,
    isArchiving,
    isUnarchiving,
    isChangingStatus,
    isTogglingPublic,
    isDeleting,
  } = useProjects();

  // Get project details to check current state
  const projectQuery = useQuery({
    ...trpc.projects.get.queryOptions({ id: projectId }),
    enabled: enabled && Boolean(projectId),
    meta: { toastOnError: false },
  });

  const handleArchive = async () => {
    try {
      await archiveProject({ id: projectId });
      onUpdate?.();

      // Redirect to projects list after archiving
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Archive failed:", error);
    }
  };

  const handleUnarchive = async () => {
    try {
      await unarchiveProject({ id: projectId });
      onUpdate?.();

      // Redirect to projects list after unarchiving
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Unarchive failed:", error);
    }
  };

  const handleChangeStatus = async (
    status: "active" | "inactive" | "maintenance",
  ) => {
    try {
      await changeProjectStatus({ id: projectId, status });
      onUpdate?.();

      // Stay on current page, just let the hook handle cache updates
    } catch (error) {
      console.error("Status change failed:", error);
    }
  };

  const handleTogglePublic = async () => {
    try {
      await toggleProjectPublic({ id: projectId });
      onUpdate?.();

      // Stay on current page, just let the hook handle cache updates
    } catch (error) {
      console.error("Toggle public failed:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject({ id: projectId });
      onUpdate?.();

      // Redirect to projects list after deletion
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return {
    project: projectQuery.data?.data.project,
    isLoading: projectQuery.isLoading,
    error: projectQuery.error,
    archiveProject: handleArchive,
    unarchiveProject: handleUnarchive,
    changeProjectStatus: handleChangeStatus,
    toggleProjectPublic: handleTogglePublic,
    deleteProject: handleDelete,
    isArchiving,
    isUnarchiving,
    isChangingStatus,
    isTogglingPublic,
    isDeleting,
  };
}
