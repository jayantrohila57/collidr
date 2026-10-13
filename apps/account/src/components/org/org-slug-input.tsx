"use client";

import { type ComponentProps, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { normalizeOrgSlugInput, slugifyOrganizationName } from "@/lib/org-slug";

type OrgSlugInputProps = Omit<ComponentProps<typeof Input>, "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

/** Lowercases slug segments as the user types (server only sees valid slugs). */
export const OrgSlugInput = forwardRef<HTMLInputElement, OrgSlugInputProps>(
  function OrgSlugInput({ value, onChange, onBlur, ...props }, ref) {
    return (
      <Input
        {...props}
        ref={ref}
        value={value}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        onChange={(e) => {
          onChange(normalizeOrgSlugInput(e.target.value));
        }}
        onBlur={(e) => {
          onChange(slugifyOrganizationName(e.target.value));
          onBlur?.(e);
        }}
      />
    );
  },
);
