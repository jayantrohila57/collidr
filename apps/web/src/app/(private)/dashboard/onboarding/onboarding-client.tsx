"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v3";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { FormField } from "@/components/patterns/form-field";
import { SubmitButton } from "@/components/patterns/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import {
  formatOrganizationCreateError,
  slugifyOrganizationName,
} from "@/lib/org-slug";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name is required")
    .max(100, "Name is too long"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(200, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens only",
    ),
});

export default function OnboardingClient() {
  const router = useRouter();
  const { afterOrganizationCreated } = useActiveOrganization();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "" },
    mode: "onChange",
  });

  const nameValue = useWatch({ control: form.control, name: "name" });
  const slugTouched = form.formState.touchedFields.slug;

  useEffect(() => {
    if (slugTouched) return;
    const next = slugifyOrganizationName(nameValue);
    if (next) form.setValue("slug", next, { shouldValidate: true });
  }, [nameValue, slugTouched, form]);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const created = await authClient.organization.create({
      name: data.name,
      slug: data.slug,
    });

    if (created.error) {
      toast.error(formatOrganizationCreateError(created.error.message));
      return;
    }

    const orgId = created.data?.id;
    if (orgId) {
      await afterOrganizationCreated(orgId);
    }

    toast.success("Organization created");
    router.replace("/dashboard");
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create your organization</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  id="org-name"
                  label="Organization name"
                  required
                  error={fieldState.error?.message}
                >
                  <Input {...field} id="org-name" placeholder="Acme Inc." />
                </FormField>
              )}
            />
            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  id="org-slug"
                  label="URL slug"
                  required
                  hint="Used in URLs and must be unique."
                  error={fieldState.error?.message}
                >
                  <Input
                    {...field}
                    id="org-slug"
                    placeholder="acme-inc"
                    autoComplete="off"
                    onChange={(e) => {
                      field.onChange(e);
                      form.setValue("slug", e.target.value, {
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                </FormField>
              )}
            />
            <SubmitButton
              isLoading={form.formState.isSubmitting}
              loadingLabel="Creating…"
              disabled={!form.formState.isValid}
              className="w-full"
            >
              Continue
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
