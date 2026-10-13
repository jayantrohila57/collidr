"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import {
  Archive,
  ArchiveRestore,
  Delete,
  Edit,
  Eye,
  EyeOff,
  MoreHorizontal,
  Power,
  RefreshCw,
} from "lucide-react";
import type { Route } from "next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import { toast } from "@/lib/toast";
import { useProjectActions } from "../hooks/use-project-actions";
import { ProjectActionDialog } from "./project-action-dialog";

interface ProjectActionsProps {
  project: ProjectOutput;
  onUpdate?: () => void;
}

function projectEditHref(slug: string | null | undefined): Route | null {
  const trimmed = slug?.trim();
  if (!trimmed) return null;
  return `/dashboard/projects/${trimmed}/edit` as Route;
}

export function ProjectActions({ project, onUpdate }: ProjectActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [unarchiveDialogOpen, setUnarchiveDialogOpen] = useState(false);

  const editHref = projectEditHref(project.slug);

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
        <MenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </MenuTrigger>
        <MenuPopup align="end" className="w-80">
          <MenuGroup>
            <MenuGroupLabel>Project Actions</MenuGroupLabel>
            {editHref ? (
              <MenuLinkItem href={editHref} onClick={() => setMenuOpen(false)}>
                <Edit className="me-2 h-4 w-4" />
                Edit Project
              </MenuLinkItem>
            ) : (
              <MenuItem disabled>
                <Edit className="me-2 h-4 w-4" />
                Edit Project (unavailable)
              </MenuItem>
            )}
          </MenuGroup>

          <MenuSeparator />

          <MenuItem
            onClick={() => void handleStatusChange("active")}
            disabled={isChangingStatus || project.status === "active"}
          >
            <Power className="me-2 h-4 w-4" />
            Set Active
          </MenuItem>
          <MenuItem
            onClick={() => void handleStatusChange("inactive")}
            disabled={isChangingStatus || project.status === "inactive"}
          >
            <RefreshCw className="me-2 h-4 w-4" />
            Set Inactive
          </MenuItem>
          <MenuItem
            onClick={() => void handleStatusChange("maintenance")}
            disabled={isChangingStatus || project.status === "maintenance"}
          >
            <RefreshCw className="me-2 h-4 w-4" />
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
                <EyeOff className="me-2 h-4 w-4" />
                Make Private
              </>
            ) : (
              <>
                <Eye className="me-2 h-4 w-4" />
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
              <ArchiveRestore className="me-2 h-4 w-4" />
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
              <Archive className="me-2 h-4 w-4" />
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
            <Delete className="me-2 h-4 w-4" />
            Delete Project
          </MenuItem>
        </MenuPopup>
      </Menu>

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
