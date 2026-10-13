"use client";

import { createProjectInput } from "@env-manager/api/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod/v3";
import { SubmitButton } from "@/components/patterns/submit-button";
import { UnsavedChangesPageGuard } from "@/components/patterns/unsaved-changes-page-guard";
import { Button } from "@/components/ui/button";
import { Card, CardPanel } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useProjects } from "../hooks/use-projects";

export function CreateProject() {
  const router = useRouter();
  const { createProject, isCreating } = useProjects();

  const form = useForm({
    resolver: zodResolver(createProjectInput),
    defaultValues: {
      name: "",
      description: "",
      repositoryUrl: "",
      websiteUrl: "",
      isPublic: false,
    },
    mode: "onChange",
  });

  const descriptionLength = form.watch("description")?.length ?? 0;

  return (
    <UnsavedChangesPageGuard
      isDirty={form.formState.isDirty}
      onDiscard={() => form.reset()}
    >
      {({ guardNavigation, allowNextNavigationWithoutPrompt }) => {
        const onSubmit = async (data: z.infer<typeof createProjectInput>) => {
          try {
            const result = await createProject({
              name: data.name.trim(),
              description: data.description?.trim() || undefined,
              repositoryUrl: data.repositoryUrl?.trim() || undefined,
              websiteUrl: data.websiteUrl?.trim() || undefined,
              isPublic: data.isPublic,
            });

            form.reset();
            allowNextNavigationWithoutPrompt();
            const slug = result?.data?.slug;
            if (slug) {
              router.push(`/dashboard/projects/${slug}`);
            } else {
              router.push("/dashboard/projects");
            }
          } catch (error) {
            console.error("Failed to create project:", error);
          }
        };

        return (
          <Card>
            <CardPanel>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 overflow-x-hidden"
              >
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <Label
                        htmlFor={field.name}
                        className="font-medium text-sm"
                      >
                        Project Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="Enter project name"
                        disabled={isCreating}
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
                      <Label
                        htmlFor={field.name}
                        className="font-medium text-sm"
                      >
                        Description{" "}
                        <span className="text-muted-foreground">
                          (Optional)
                        </span>
                      </Label>
                      <Textarea
                        {...field}
                        id={field.name}
                        placeholder="Provide a brief description of your project to help team members understand its purpose..."
                        rows={4}
                        maxLength={500}
                        className="wrap-anywhere resize-none"
                        disabled={isCreating}
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
                  name="repositoryUrl"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <Label
                        htmlFor={field.name}
                        className="font-medium text-sm"
                      >
                        Repository URL{" "}
                        <span className="text-muted-foreground">
                          (Optional)
                        </span>
                      </Label>
                      <Input
                        {...field}
                        id={field.name}
                        type="url"
                        placeholder="https://github.com/org/repo"
                        disabled={isCreating}
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
                      <Label
                        htmlFor={field.name}
                        className="font-medium text-sm"
                      >
                        Website URL{" "}
                        <span className="text-muted-foreground">
                          (Optional)
                        </span>
                      </Label>
                      <Input
                        {...field}
                        id={field.name}
                        type="url"
                        placeholder="https://your-project.com"
                        disabled={isCreating}
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
                  name="isPublic"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <Label htmlFor="project-visibility" className="text-sm">
                          Public project
                        </Label>
                        <p className="wrap-anywhere text-muted-foreground text-xs">
                          Private by default. Public projects may expose
                          metadata to others.
                        </p>
                      </div>
                      <Switch
                        id="project-visibility"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isCreating}
                        className="shrink-0"
                      />
                    </div>
                  )}
                />

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                  <div className="text-muted-foreground text-sm">
                    <span className="text-destructive">*</span> Required fields
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => guardNavigation(() => form.reset())}
                      disabled={isCreating}
                    >
                      Clear
                    </Button>
                    <SubmitButton
                      isLoading={isCreating}
                      loadingLabel="Creating…"
                      disabled={!form.formState.isValid}
                    >
                      Create Project
                    </SubmitButton>
                  </div>
                </div>
              </form>
            </CardPanel>
          </Card>
        );
      }}
    </UnsavedChangesPageGuard>
  );
}
