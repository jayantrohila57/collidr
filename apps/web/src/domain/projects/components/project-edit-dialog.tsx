"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { Edit } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EditProject } from "./project-edit";

interface EditProjectDialogProps {
  project: ProjectOutput;
  onUpdate?: () => void;
  triggerVariant?: "menu" | "button";
}

export function EditProjectDialog({
  project,
  onUpdate,
  triggerVariant = "menu",
}: EditProjectDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onUpdate?.();
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerVariant === "menu" ? (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Project
          </DropdownMenuItem>
        ) : (
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update details for "{project.name}". Changes will be saved
            immediately.
          </DialogDescription>
        </DialogHeader>
        <EditProject
          project={project}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
