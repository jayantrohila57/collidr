"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/lib/toast";
import { useProjectActions } from "../hooks/use-project-actions";
import { EditProjectSheet } from "./edit-project-sheet";
import { ProjectActionDialog } from "./project-action-dialog";

interface ProjectActionsProps {
  project: ProjectOutput;
  onUpdate?: () => void;
}

const menuIconClass = "me-2 text-foreground";

export function ProjectActions({ project, onUpdate }: ProjectActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
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

  const handleStatusChange = async (
    status: "active" | "inactive" | "maintenance",
  ) => {
    setMenuOpen(false);
    try {
      await changeProjectStatus(status);
      const label =
        status === "active"
          ? "active"
          : status === "inactive"
            ? "inactive"
            : "maintenance";
      toast.success(`Project marked as ${label}`);
    } catch {
      // Error toast handled globally
    }
  };

  return (
    <>
      <Menu open={menuOpen} onOpenChange={setMenuOpen}>
        <Tooltip>
          <TooltipTrigger
            render={
              <MenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Project actions"
                  />
                }
              />
            }
          >
            <AppIcon name="rowActionsAlt" />
          </TooltipTrigger>
          <TooltipContent>Project actions</TooltipContent>
        </Tooltip>
        <MenuPopup align="end" className="w-80">
          <MenuGroup>
            <MenuGroupLabel>Project Actions</MenuGroupLabel>
            <MenuItem
              onClick={() => {
                setMenuOpen(false);
                setEditOpen(true);
              }}
            >
              <AppIcon name="edit" className={menuIconClass} />
              Edit Project
            </MenuItem>
          </MenuGroup>

          <MenuSeparator />

          <MenuItem
            onClick={() => void handleStatusChange("active")}
            disabled={isChangingStatus || project.status === "active"}
          >
            <AppIcon name="power" className={menuIconClass} />
            Set Active
          </MenuItem>
          <MenuItem
            onClick={() => void handleStatusChange("inactive")}
            disabled={isChangingStatus || project.status === "inactive"}
          >
            <AppIcon name="statusInactive" className={menuIconClass} />
            Set Inactive
          </MenuItem>
          <MenuItem
            onClick={() => void handleStatusChange("maintenance")}
            disabled={isChangingStatus || project.status === "maintenance"}
          >
            <AppIcon name="statusMaintenance" className={menuIconClass} />
            Set Maintenance
          </MenuItem>

          <MenuSeparator />

          <MenuItem
            onClick={() => {
              setMenuOpen(false);
              void toggleProjectPublic();
            }}
            disabled={isTogglingPublic}
          >
            {project.isPublic ? (
              <>
                <AppIcon name="hide" className={menuIconClass} />
                Make Private
              </>
            ) : (
              <>
                <AppIcon name="reveal" className={menuIconClass} />
                Make Public
              </>
            )}
          </MenuItem>

          <MenuSeparator />

          {project.isArchived ? (
            <MenuItem
              onClick={() => {
                setMenuOpen(false);
                setUnarchiveDialogOpen(true);
              }}
              disabled={isUnarchiving}
            >
              <AppIcon name="archiveRestore" className={menuIconClass} />
              Unarchive Project
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                setMenuOpen(false);
                setArchiveDialogOpen(true);
              }}
              disabled={isArchiving}
            >
              <AppIcon name="statusArchived" className={menuIconClass} />
              Archive Project
            </MenuItem>
          )}

          <MenuSeparator />

          <MenuItem
            onClick={() => {
              setMenuOpen(false);
              setDeleteDialogOpen(true);
            }}
            variant="destructive"
            disabled={isDeleting}
          >
            <AppIcon name="delete" className={menuIconClass} />
            Delete Project
          </MenuItem>
        </MenuPopup>
      </Menu>

      <EditProjectSheet
        project={project}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onUpdate}
      />

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

      <ProjectActionDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        title="Archive Project"
        description={`Are you sure you want to archive "${project.name}"? Archived projects are hidden from the main view but can be restored later.`}
        actionText="Archive Project"
        onConfirm={archiveProject}
        isPending={isArchiving}
      />

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
