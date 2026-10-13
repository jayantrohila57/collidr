"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { updateProjectInput } from "@env-manager/api/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod/v3";
import { SubmitButton } from "@/components/patterns/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { layoutSheetPanelClass } from "@/lib/layout-spacing";
import { useProjects } from "../hooks/use-projects";

interface EditProjectSheetProps {
  project: ProjectOutput;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditProjectSheet({
  project,
  open,
  onOpenChange,
  onSuccess,
}: EditProjectSheetProps) {
  const { updateProject, isUpdating } = useProjects();

  const form = useForm({
    resolver: zodResolver(updateProjectInput),
    defaultValues: {
      id: project.id,
      name: project.name,
      description: project.description || "",
      repositoryUrl: project.repositoryUrl || "",
      websiteUrl: project.websiteUrl || "",
      isPublic: project.isPublic,
    },
    mode: "onChange",
  });

  const descriptionLength = form.watch("description")?.length ?? 0;

  useEffect(() => {
    if (open) {
      form.reset({
        id: project.id,
        name: project.name,
        description: project.description || "",
        repositoryUrl: project.repositoryUrl || "",
        websiteUrl: project.websiteUrl || "",
        isPublic: project.isPublic,
      });
    }
  }, [open, project, form]);

  const onSubmit = async (data: z.infer<typeof updateProjectInput>) => {
    try {
      await updateProject({
        id: data.id,
        name: data.name?.trim(),
        description: data.description?.trim() || undefined,
        repositoryUrl: data.repositoryUrl?.trim() || undefined,
        websiteUrl: data.websiteUrl?.trim() || undefined,
        isPublic: data.isPublic,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPopup variant="inset">
        <SheetHeader>
          <SheetTitle>Edit Project</SheetTitle>
          <SheetDescription>
            Update details for &quot;{project.name}&quot;. Changes are saved
            when you submit.
          </SheetDescription>
        </SheetHeader>
        <form className="contents" onSubmit={form.handleSubmit(onSubmit)}>
          <SheetPanel className={layoutSheetPanelClass}>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="font-medium text-sm">
                    Project Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Enter project name"
                    disabled={isUpdating}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <p className="text-destructive text-sm">
                      {fieldState.error?.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="font-medium text-sm">
                    Description{" "}
                    <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Textarea
                    {...field}
                    id={field.name}
                    placeholder="Brief description…"
                    rows={4}
                    maxLength={500}
                    className="wrap-anywhere resize-none"
                    disabled={isUpdating}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <p className="text-destructive text-sm">
                      {fieldState.error?.message}
                    </p>
                  )}
                  <p
                    className={`text-xs ${
                      descriptionLength > 500
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {descriptionLength}/500 characters
                  </p>
                </div>
              )}
            />
            <Controller
              name="isPublic"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center justify-between gap-2 rounded-lg border p-2">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <Label
                      htmlFor="edit-project-visibility"
                      className="text-sm"
                    >
                      Public project
                    </Label>
                    <p className="wrap-anywhere text-muted-foreground text-xs">
                      When enabled, project metadata may be visible to others.
                    </p>
                  </div>
                  <Switch
                    id="edit-project-visibility"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isUpdating}
                    className="shrink-0"
                  />
                </div>
              )}
            />
            <Controller
              name="repositoryUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="font-medium text-sm">
                    Repository URL{" "}
                    <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    {...field}
                    id={field.name}
                    type="url"
                    placeholder="https://github.com/org/repo"
                    disabled={isUpdating}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <p className="text-destructive text-sm">
                      {fieldState.error?.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="websiteUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="font-medium text-sm">
                    Website URL{" "}
                    <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    {...field}
                    id={field.name}
                    type="url"
                    placeholder="https://your-project.com"
                    disabled={isUpdating}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <p className="text-destructive text-sm">
                      {fieldState.error?.message}
                    </p>
                  )}
                </div>
              )}
            />
          </SheetPanel>
          <SheetFooter>
            <SheetClose
              render={
                <Button variant="ghost" type="button" disabled={isUpdating} />
              }
            >
              Cancel
            </SheetClose>
            <SubmitButton
              isLoading={isUpdating}
              loadingLabel="Updating…"
              disabled={!form.formState.isValid}
            >
              Update Project
            </SubmitButton>
          </SheetFooter>
        </form>
      </SheetPopup>
    </Sheet>
  );
}
