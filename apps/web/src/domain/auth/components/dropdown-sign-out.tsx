"use client";

import * as React from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { MenuItem } from "@/components/ui/menu";
import { actionToast } from "@/lib/action-toast";
import { cn } from "@/lib/utils";
import { signOut } from "../lib/auth-actions";

export const SignOutDropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof MenuItem> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => {
  const [isLoading, startTransition] = React.useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await actionToast(
          new Promise<void>((resolve, reject) => {
            void signOut(
              () => resolve(),
              (error) => reject(error),
            );
          }),
          {
            loading: "Signing out…",
            success: "Sign out successful",
            error: "Sign out failed",
          },
        );
      } catch {
        // Toast handled by actionToast
      }
    });
  };

  return (
    <MenuItem
      ref={ref}
      onClick={handleSignOut}
      disabled={isLoading}
      className={cn(inset && "ps-8", className)}
      {...props}
    >
      <AppIcon name="logOut" className="size-4" />
      {isLoading ? "Signing out…" : "Sign out"}
    </MenuItem>
  );
});
SignOutDropdownMenuItem.displayName = "SignOutDropdownMenuItem";
