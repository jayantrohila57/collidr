"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import {
  Archive,
  ArchiveRestore,
  Delete,
  Eye,
  EyeOff,
  MoreHorizontal,
  Power,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjectActions } from "../hooks/use-project-actions";
import { ProjectActionDialog } from "./project-action-dialog";
import { EditProjectDialog } from "./project-edit-dialog";

interface ProjectActionsProps {
  project: ProjectOutput;
  onUpdate?: () => void;
}

export function ProjectActions({ project, onUpdate }: ProjectActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [unarchiveDialogOpen, setUnarchiveDialogOpen] = useState(false);

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
  } = useProjectActions({ projectId: project.id, onUpdate });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Edit Action */}
          <EditProjectDialog project={project} onUpdate={onUpdate} />

          <DropdownMenuSeparator />

          {/* Status Actions */}
          <DropdownMenuItem
            onClick={() => changeProjectStatus("active")}
            disabled={isChangingStatus || project.status === "active"}
          >
            <Power className="mr-2 h-4 w-4" />
            Set Active
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => changeProjectStatus("inactive")}
            disabled={isChangingStatus || project.status === "inactive"}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Set Inactive
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => changeProjectStatus("maintenance")}
            disabled={isChangingStatus || project.status === "maintenance"}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Set Maintenance
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Visibility Actions */}
          <DropdownMenuItem
            onClick={() => toggleProjectPublic()}
            disabled={isTogglingPublic}
          >
            {project.isPublic ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Make Private
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Make Public
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Archive Actions */}
          {project.isArchived ? (
            <DropdownMenuItem
              onClick={() => setUnarchiveDialogOpen(true)}
              disabled={isUnarchiving}
            >
              <ArchiveRestore className="mr-2 h-4 w-4" />
              Unarchive Project
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => setArchiveDialogOpen(true)}
              disabled={isArchiving}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive Project
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Delete Action */}
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
            disabled={isDeleting}
          >
            <Delete className="mr-2 h-4 w-4" />
            Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <ProjectActionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone and will permanently delete all environments and variables associated with this project.`}
        actionText="Delete Project"
        variant="destructive"
        onConfirm={deleteProject}
        isPending={isDeleting}
      />

      {/* Archive Confirmation Dialog */}
      <ProjectActionDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        title="Archive Project"
        description={`Are you sure you want to archive "${project.name}"? Archived projects are hidden from the main view but can be restored later.`}
        actionText="Archive Project"
        onConfirm={archiveProject}
        isPending={isArchiving}
      />

      {/* Unarchive Confirmation Dialog */}
      <ProjectActionDialog
        open={unarchiveDialogOpen}
        onOpenChange={setUnarchiveDialogOpen}
        title="Unarchive Project"
        description={`Are you sure you want to unarchive "${project.name}"? This will make it visible in the main project view.`}
        actionText="Unarchive Project"
        onConfirm={unarchiveProject}
        isPending={isUnarchiving}
      />
    </>
  );
}
