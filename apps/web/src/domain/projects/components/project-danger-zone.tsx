"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { useProjectActions } from "../hooks/use-project-actions";
import { ProjectActionDialog } from "./project-action-dialog";

interface ProjectDangerZoneProps {
  project: ProjectOutput;
}

export function ProjectDangerZone({ project }: ProjectDangerZoneProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [unarchiveDialogOpen, setUnarchiveDialogOpen] = useState(false);

  const {
    archiveProject,
    unarchiveProject,
    deleteProject,
    isArchiving,
    isUnarchiving,
    isDeleting,
  } = useProjectActions({ projectId: project.id });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>
            Archive or permanently delete this project and all of its
            environments.
          </CardDescription>
        </CardHeader>
        <CardPanel className="flex flex-col gap-4">
          {project.isArchived ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm">
                This project is archived and hidden from the main project list.
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={isUnarchiving}
                onClick={() => setUnarchiveDialogOpen(true)}
              >
                Unarchive project
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm">
                Archive hides the project without deleting environments or
                variables.
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={isArchiving}
                onClick={() => setArchiveDialogOpen(true)}
              >
                Archive project
              </Button>
            </div>
          )}
          <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              Deleting removes all environments, variables, and history. This
              cannot be undone.
            </p>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete project
            </Button>
          </div>
        </CardPanel>
      </Card>

      <ProjectActionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete project"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone and will permanently delete all environments and variables associated with this project.`}
        actionText="Delete project"
        variant="destructive"
        onConfirm={deleteProject}
        isPending={isDeleting}
      />

      <ProjectActionDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        title="Archive project"
        description={`Are you sure you want to archive "${project.name}"? Archived projects are hidden from the main view but can be restored later.`}
        actionText="Archive project"
        onConfirm={archiveProject}
        isPending={isArchiving}
      />

      <ProjectActionDialog
        open={unarchiveDialogOpen}
        onOpenChange={setUnarchiveDialogOpen}
        title="Unarchive project"
        description={`Are you sure you want to unarchive "${project.name}"? This will make it visible in the main project view.`}
        actionText="Unarchive project"
        onConfirm={unarchiveProject}
        isPending={isUnarchiving}
      />
    </>
  );
}
