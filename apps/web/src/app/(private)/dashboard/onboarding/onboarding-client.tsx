"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod/v3";
import { PageStack } from "@/components/layout/app-layout";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { OrgSlugInput } from "@/components/org/org-slug-input";
import { AppIcon } from "@/components/patterns/app-icon";
import { FormField } from "@/components/patterns/form-field";
import {
  FormSheet,
  FormSheetBody,
  FormSheetFooter,
  FormSheetForm,
  FormSheetHeader,
  FormSheetPopup,
} from "@/components/patterns/form-sheet";
import { SheetTitleWithIcon } from "@/components/patterns/sheet-title-with-icon";
import { SubmitButton } from "@/components/patterns/submit-button";
import { UnsavedChangesPageGuard } from "@/components/patterns/unsaved-changes-page-guard";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Frame } from "@/components/ui/frame";
import { Input } from "@/components/ui/input";
import { SheetDescription } from "@/components/ui/sheet";
import { actionToast } from "@/lib/action-toast";
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

  return (
    <UnsavedChangesPageGuard
      isDirty={form.formState.isDirty}
      onDiscard={() => form.reset()}
    >
      {({ allowNextNavigationWithoutPrompt }) => {
        const onSubmit = async (data: z.infer<typeof schema>) => {
          form.clearErrors("slug");
          try {
            const created = await actionToast(
              (async () => {
                const result = await authClient.organization.create({
                  name: data.name,
                  slug: data.slug,
                });
                if (result.error) {
                  const message = formatOrganizationCreateError(
                    result.error.message,
                  );
                  if (message.toLowerCase().includes("slug")) {
                    form.setError("slug", { message });
                  }
                  throw new Error(message);
                }
                return result;
              })(),
              {
                loading: "Creating organization…",
                success: "Organization created",
                error: "Could not create organization",
              },
            );

            const orgId = created.data?.id;
            setNavigating(true);

            if (orgId) {
              await afterOrganizationCreated(orgId);
            }

            form.reset();
            allowNextNavigationWithoutPrompt();
            router.replace("/dashboard");
          } catch {
            // Toast handled by actionToast
          }
        };

        return (
          <PageStack className="min-h-svh flex-1">
            <Frame className="w-full flex-1">
              <Empty className="border border-dashed py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <AppIcon name="organization" className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>Create your organization</EmptyTitle>
                  <EmptyDescription>
                    You need a workspace before adding projects and
                    environments.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </Frame>
            <FormSheet open onOpenChange={() => {}}>
              <FormSheetPopup showCloseButton={false}>
                <FormSheetHeader>
                  <SheetTitleWithIcon icon="organization">
                    Create your organization
                  </SheetTitleWithIcon>
                  <SheetDescription>
                    This name appears in the sidebar team switcher.
                  </SheetDescription>
                </FormSheetHeader>
                <FormSheetForm onSubmit={form.handleSubmit(onSubmit)}>
                  <FormSheetBody>
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
                          <Input
                            {...field}
                            id="org-name"
                            placeholder="Acme Inc."
                          />
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
                  </FormSheetBody>
                  <FormSheetFooter>
                    <SubmitButton
                      isLoading={isBusy}
                      loadingLabel="Creating…"
                      disabled={!form.formState.isValid || isBusy}
                    >
                      Continue
                    </SubmitButton>
                  </FormSheetFooter>
                </FormSheetForm>
              </FormSheetPopup>
            </FormSheet>
          </PageStack>
        );
      }}
    </UnsavedChangesPageGuard>
  );
}
