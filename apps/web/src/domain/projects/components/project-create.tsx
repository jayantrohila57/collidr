"use client";

import { createProjectInput } from "@env-manager/api/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod/v3";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="border-none bg-input/10 shadow-none">
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 overflow-x-hidden"
        >
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="font-medium text-sm">
                  Project Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Enter project name"
                  className={
                    fieldState.invalid
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }
                  disabled={isCreating}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <p className="mt-1 text-red-500 text-sm">
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
                  Description <span className="text-gray-400">(Optional)</span>
                </Label>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder="Provide a brief description of your project to help team members understand its purpose..."
                  rows={4}
                  maxLength={500}
                  className={`resize-none break-all ${
                    fieldState.invalid
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  disabled={isCreating}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <p className="mt-1 text-red-500 text-sm">
                    {fieldState.error?.message}
                  </p>
                )}
                <p
                  className={`mt-1 text-xs ${
                    descriptionLength > 500 ? "text-red-500" : "text-gray-500"
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
                <Label htmlFor={field.name} className="font-medium text-sm">
                  Repository URL{" "}
                  <span className="text-gray-400">(Optional)</span>
                </Label>
                <Input
                  {...field}
                  id={field.name}
                  type="url"
                  placeholder="https://github.com/username/repo"
                  className={
                    fieldState.invalid
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }
                  disabled={isCreating}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <p className="mt-1 text-red-500 text-sm">
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
                  Website URL <span className="text-gray-400">(Optional)</span>
                </Label>
                <Input
                  {...field}
                  id={field.name}
                  type="url"
                  placeholder="https://your-project.com"
                  className={
                    fieldState.invalid
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }
                  disabled={isCreating}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <p className="mt-1 text-red-500 text-sm">
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
              <div className="flex items-center justify-between rounded-lg border bg-background p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="project-visibility" className="text-sm">
                    Public project
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Private by default. Public projects may expose metadata to
                    others.
                  </p>
                </div>
                <Switch
                  id="project-visibility"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isCreating}
                />
              </div>
            )}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            <div className="text-gray-500 text-sm">
              <span className="text-red-500">*</span> Required fields
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isCreating}
              >
                Clear
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !form.formState.isValid}
                className="min-w-[120px]"
              >
                {isCreating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-white border-b-2" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
