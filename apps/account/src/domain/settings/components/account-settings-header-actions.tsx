"use client";

import type { Route } from "next";
import Link from "next/link";
import { AppIcon } from "@/components/patterns/app-icon";
import { Button } from "@/components/ui/button";
import { Can } from "@/domain/permissions/components/can";
import { accountSettingsActions } from "@/domain/permissions/org-section-actions";

export function AccountSettingsHeaderActions() {
  return (
    <Can action={accountSettingsActions.export}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="gap-2"
        render={<Link href={"/settings?tab=export" as Route} />}
      >
        <AppIcon name="archiveRestore" className="text-current" />
        Export data
      </Button>
    </Can>
  );
}
