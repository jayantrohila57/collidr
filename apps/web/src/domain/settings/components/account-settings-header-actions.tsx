"use client";

import type { Route } from "next";
import Link from "next/link";
import { AppIcon } from "@/components/patterns/app-icon";
import { Button } from "@/components/ui/button";

export function AccountSettingsHeaderActions() {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="gap-2"
      render={<Link href={"/dashboard/settings?tab=export" as Route} />}
    >
      <AppIcon name="archiveRestore" className="text-current" />
      Export data
    </Button>
  );
}
