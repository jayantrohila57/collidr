"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v3";
import { PageContainer } from "@/components/layout/page-container";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { OrgSlugInput } from "@/components/org/org-slug-input";
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
    .transform((value) => slugifyOrganizationName(value))
    .pipe(
      z
        .string()
        .min(2, "Slug is required")
        .max(200, "Slug is too long")
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Use lowercase letters, numbers, and hyphens only",
        ),
    ),
});

export default function OnboardingClient() {
  const router = useRouter();
  const { afterOrganizationCreated } = useActiveOrganization();
  const [navigating, setNavigating] = useState(false);
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

  const isBusy = form.formState.isSubmitting || navigating;

  const onSubmit = async (data: z.infer<typeof schema>) => {
    form.clearErrors("slug");
    const created = await authClient.organization.create({
      name: data.name,
      slug: data.slug,
    });

    if (created.error) {
      const message = formatOrganizationCreateError(created.error.message);
      if (message.toLowerCase().includes("slug")) {
        form.setError("slug", { message });
      }
      toast.error(message);
      return;
    }

    const orgId = created.data?.id;
    toast.success("Organization created");
    setNavigating(true);

    if (orgId) {
      await afterOrganizationCreated(orgId);
    }

    router.replace("/dashboard");
  };

  return (
    <PageContainer
      size="narrow"
      className="min-h-svh justify-center py-4 md:py-6"
    >
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
                  hint="Slugs use lowercase letters, numbers, and hyphens."
                  error={fieldState.error?.message}
                >
                  <OrgSlugInput
                    id="org-slug"
                    placeholder="acme-inc"
                    autoComplete="off"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormField>
              )}
            />
            <SubmitButton
              isLoading={isBusy}
              loadingLabel="Creating…"
              disabled={!form.formState.isValid || isBusy}
              className="w-full"
            >
              Continue
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
