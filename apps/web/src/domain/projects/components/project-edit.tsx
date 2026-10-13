"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { updateProjectInput } from "@env-manager/api/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod/v3";
import {
  SettingsField,
  SettingsPanel,
  SettingsRow,
  SettingsSectionHeader,
  settingsControlWidthClass,
} from "@/components/patterns/settings-layout";
import { SubmitButton } from "@/components/patterns/submit-button";
import { UnsavedChangesPageGuard } from "@/components/patterns/unsaved-changes-page-guard";
import { Button } from "@/components/ui/button";
import { Card, CardPanel } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useProjects } from "../hooks/use-projects";

interface EditProjectProps {
  project: ProjectOutput;
  onSuccess?: () => void;
  onCancel?: () => void;
  embedded?: boolean;
}

export function EditProject({
  project,
  onSuccess,
  onCancel,
  embedded = false,
}: EditProjectProps) {
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

  const onSubmit = async (
    data: z.infer<typeof updateProjectInput>,
    allowNextNavigationWithoutPrompt: () => void,
  ) => {
    try {
      await updateProject({
        id: data.id,
        name: data.name?.trim(),
        description: data.description?.trim() || undefined,
        repositoryUrl: data.repositoryUrl?.trim() || undefined,
        websiteUrl: data.websiteUrl?.trim() || undefined,
        isPublic: data.isPublic,
      });

      form.reset(data);
      allowNextNavigationWithoutPrompt();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  const fieldInputClass = embedded ? settingsControlWidthClass : undefined;

  const formBody = (guardNavigation: (action: () => void) => void) => (
    <>
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) =>
          embedded ? (
            <SettingsField
              label="Project name"
              description="Required. Shown across the workspace."
            >
              <div className="space-y-1">
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Enter project name"
                  disabled={isUpdating}
                  aria-invalid={fieldState.invalid}
                  className={fieldInputClass}
                />
                {fieldState.invalid ? (
                  <p className="text-destructive text-xs">
                    {fieldState.error?.message}
                  </p>
                ) : null}
              </div>
            </SettingsField>
          ) : (
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
          )
        }
      />

      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) =>
          embedded ? (
            <SettingsField
              label="Description"
              description="Optional summary for your team."
              controlClassName="w-full max-w-md"
            >
              <div className="space-y-1">
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
                {fieldState.invalid ? (
                  <p className="text-destructive text-xs">
                    {fieldState.error?.message}
                  </p>
                ) : null}
                <p
                  className={cn(
                    "text-xs",
                    descriptionLength > 500
                      ? "text-destructive"
                      : "text-muted-foreground",
                  )}
                >
                  {descriptionLength}/500 characters
                </p>
              </div>
            </SettingsField>
          ) : (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="font-medium text-sm">
                Description{" "}
                <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Textarea
                {...field}
                id={field.name}
                placeholder="Provide a brief description of your project…"
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
                className={cn(
                  "text-xs",
                  descriptionLength > 500
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {descriptionLength}/500 characters
              </p>
            </div>
          )
        }
      />

      <Controller
        name="isPublic"
        control={form.control}
        render={({ field }) =>
          embedded ? (
            <SettingsRow
              label="Public project"
              description="When enabled, project metadata may be visible to others."
            >
              <Switch
                id="edit-project-visibility"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isUpdating}
              />
            </SettingsRow>
          ) : (
            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div className="min-w-0 flex-1 space-y-0.5">
                <Label htmlFor="edit-project-visibility" className="text-sm">
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
          )
        }
      />

      <Controller
        name="repositoryUrl"
        control={form.control}
        render={({ field, fieldState }) =>
          embedded ? (
            <SettingsField label="Repository URL" description="Optional.">
              <div className="space-y-1">
                <Input
                  {...field}
                  id={field.name}
                  type="url"
                  placeholder="https://github.com/org/repo"
                  disabled={isUpdating}
                  aria-invalid={fieldState.invalid}
                  className={fieldInputClass}
                />
                {fieldState.invalid ? (
                  <p className="text-destructive text-xs">
                    {fieldState.error?.message}
                  </p>
                ) : null}
              </div>
            </SettingsField>
          ) : (
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
          )
        }
      />

      <Controller
        name="websiteUrl"
        control={form.control}
        render={({ field, fieldState }) =>
          embedded ? (
            <SettingsField label="Website URL" description="Optional.">
              <div className="space-y-1">
                <Input
                  {...field}
                  id={field.name}
                  type="url"
                  placeholder="https://your-project.com"
                  disabled={isUpdating}
                  aria-invalid={fieldState.invalid}
                  className={fieldInputClass}
                />
                {fieldState.invalid ? (
                  <p className="text-destructive text-xs">
                    {fieldState.error?.message}
                  </p>
                ) : null}
              </div>
            </SettingsField>
          ) : (
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
          )
        }
      />

      {embedded ? (
        <SettingsRow
          label="Save changes"
          description="Required fields marked in form."
        >
          <div className="flex flex-wrap justify-end gap-2">
            {onCancel ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => guardNavigation(onCancel)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            ) : null}
            <SubmitButton
              size="sm"
              isLoading={isUpdating}
              loadingLabel="Updating…"
              disabled={!form.formState.isValid}
            >
              Update project
            </SubmitButton>
          </div>
        </SettingsRow>
      ) : (
        <div className="flex items-center justify-between pt-4">
          <div className="text-muted-foreground text-sm">
            <span className="text-destructive">*</span> Required fields
          </div>
          <div className="flex gap-2">
            {onCancel ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => guardNavigation(onCancel)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            ) : null}
            <SubmitButton
              isLoading={isUpdating}
              loadingLabel="Updating…"
              disabled={!form.formState.isValid}
            >
              Update Project
            </SubmitButton>
          </div>
        </div>
      )}
    </>
  );

  const revertForm = () =>
    form.reset({
      id: project.id,
      name: project.name,
      description: project.description || "",
      repositoryUrl: project.repositoryUrl || "",
      websiteUrl: project.websiteUrl || "",
      isPublic: project.isPublic,
    });

  if (embedded) {
    return (
      <UnsavedChangesPageGuard
        isDirty={form.formState.isDirty}
        onDiscard={revertForm}
      >
        {({ guardNavigation, allowNextNavigationWithoutPrompt }) => (
          <SettingsPanel>
            <SettingsSectionHeader
              title="Project details"
              description="Name, links, and visibility."
            />
            <form
              onSubmit={form.handleSubmit((data) =>
                onSubmit(data, allowNextNavigationWithoutPrompt),
              )}
            >
              {formBody(guardNavigation)}
            </form>
          </SettingsPanel>
        )}
      </UnsavedChangesPageGuard>
    );
  }

  return (
    <UnsavedChangesPageGuard
      isDirty={form.formState.isDirty}
      onDiscard={revertForm}
    >
      {({ guardNavigation, allowNextNavigationWithoutPrompt }) => (
        <Card>
          <CardPanel>
            <form
              onSubmit={form.handleSubmit((data) =>
                onSubmit(data, allowNextNavigationWithoutPrompt),
              )}
              className="space-y-4"
            >
              {formBody(guardNavigation)}
            </form>
          </CardPanel>
        </Card>
      )}
    </UnsavedChangesPageGuard>
  );
}
