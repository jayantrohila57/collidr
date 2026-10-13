"use client";

import * as React from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { MenuItem } from "@/components/ui/menu";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/lib/toast";
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
      const toastId = toast.loading("Signing out...");
      await signOut(
        () => {
          toast.success("Sign out successful", { id: toastId });
        },
        (error) => {
          console.error("Sign out failed", error);
          toast.error("Sign out failed", { id: toastId });
        },
      );
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
      {isLoading ? <Spinner /> : <AppIcon name="logOut" className="size-4" />}
      {isLoading ? "Signing out..." : "Sign out"}
    </MenuItem>
  );
});
SignOutDropdownMenuItem.displayName = "SignOutDropdownMenuItem";
