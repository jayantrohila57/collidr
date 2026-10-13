"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Can } from "@/domain/permissions/components/can";
import { accountSettingsActions } from "@/domain/permissions/org-section-actions";
import { trpc } from "@/utils/trpc";

export function ExportDataButton() {
  const mutation = useMutation(trpc.account.exportData.mutationOptions());

  return (
    <Can action={accountSettingsActions.export}>
      <Button
        type="button"
        disabled={mutation.isPending}
        onClick={async () => {
          const data = await mutation.mutateAsync();
          const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = `collidr-export-${new Date().toISOString()}.json`;
          anchor.click();
          URL.revokeObjectURL(url);
        }}
      >
        {mutation.isPending ? "Preparing…" : "Download JSON"}
      </Button>
    </Can>
  );
}
