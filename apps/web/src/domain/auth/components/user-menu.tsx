"use client";

import type { User } from "better-auth";
import { LogOut } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { touchTarget } from "@/lib/utils";
import { signOut, useSession } from "../lib/auth-actions";

export function UserMenu() {
  const [isLoading, startTransition] = useTransition();
  const { data: session, isPending } = useSession();
  const user = session?.user as User | undefined;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = () => {
    startTransition(async () => {
      const toastId = toast.loading("Signing out...");
      try {
        await signOut(
          () => {
            toast.success("Signed out successfully", { id: toastId });
          },
          () => {
            toast.error("Sign out failed", { id: toastId });
          },
        );
      } catch {
        toast.error("Sign out failed", { id: toastId });
      }
    });
  };

  if (!mounted || isPending) {
    return (
      <div
        className="flex size-9 items-center justify-center rounded-full border bg-muted"
        aria-hidden
      >
        <Spinner className="size-4" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`size-11 rounded-full p-0 ${touchTarget}`}
          aria-label="Open account menu"
        >
          <Avatar className="size-9 border bg-background shadow-xs">
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback>
              {user.name?.charAt(0) || user.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm leading-none">{user.name}</p>
            {user.email && (
              <p className="text-muted-foreground text-xs leading-none">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
          <LogOut className="me-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
