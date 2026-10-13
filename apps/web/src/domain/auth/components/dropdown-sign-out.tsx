"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { MenuItem } from "@/components/ui/menu";
import { actionToast } from "@/lib/action-toast";
import { cn } from "@/lib/utils";
import { performSignOut } from "../lib/auth-actions";

export const SignOutDropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof MenuItem> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignOut = () => {
    setIsLoading(true);
    void actionToast(
      performSignOut({ queryClient, router }).finally(() =>
        setIsLoading(false),
      ),
      {
        loading: "Signing out…",
        success: "Signed out",
        error: "Sign out failed",
      },
    ).catch(() => {
      // Toast handled by actionToast
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
