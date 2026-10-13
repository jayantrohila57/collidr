"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

export function OrganizationsFeatureGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!isOrganizationsEnabledOnClient()) {
      router.replace("/dashboard" as Route);
    }
  }, [router]);

  if (!isOrganizationsEnabledOnClient()) {
    return null;
  }

  return children;
}
