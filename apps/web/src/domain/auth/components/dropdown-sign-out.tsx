"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { LogOut } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { signOut } from "../lib/auth-actions";

export const SignOutDropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset }, ref) => {
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
    <DropdownMenuPrimitive.Item
      ref={ref}
      onClick={handleSignOut}
      disabled={isLoading}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        inset && "ps-8",
        className,
      )}
    >
      {isLoading ? <Spinner /> : <LogOut className="h-4 w-4" />}
      {isLoading ? "Signing out..." : "Sign out"}
    </DropdownMenuPrimitive.Item>
  );
});
SignOutDropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
