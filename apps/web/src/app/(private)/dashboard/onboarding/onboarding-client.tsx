"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v3";
import { FormField } from "@/components/patterns/form-field";
import { SubmitButton } from "@/components/patterns/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name is required")
    .max(100, "Name is too long"),
});

export default function OnboardingClient() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const created = await authClient.organization.create({
      name: data.name,
      slug: slug || `org-${Date.now()}`,
    });

    if (created.error) {
      toast.error(created.error.message ?? "Could not create organization");
      return;
    }

    const orgId = created.data?.id;
    if (orgId) {
      await authClient.organization.setActive({ organizationId: orgId });
    }

    toast.success("Organization created");
    router.replace("/dashboard/projects/new");
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
