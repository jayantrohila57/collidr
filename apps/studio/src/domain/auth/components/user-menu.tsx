"use client";

import {
  HeaderUserMenu,
  type UserMenuProps,
} from "@loftlancer/ui/patterns/sidebar-kit";
import { docsUrl } from "@loftlancer/ui/platform-urls";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { accountSettingsUrl } from "@/lib/account-url";
import { withBasePath } from "@/lib/base-path";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";
import { performSignOut, useSession } from "../lib/auth-actions";

/** Props for the shared user menu, used by the header avatar and sidebar footer. */
export function useUserMenuProps(): UserMenuProps & { ready: boolean } {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending } = useSession();
  const { data } = useQuery({
    ...trpc.sidebar.navigator.queryOptions(),
    staleTime: 30_000,
  });
  const orgSlug = data?.organizationSlug ?? null;
  return {
    ready: !isPending,
    user: session?.user ?? null,
    accountHref: accountSettingsUrl(),
    organizationSettingsHref:
      isOrganizationsEnabledOnClient() && orgSlug
        ? withBasePath(routes.orgSection(orgSlug, "settings"))
        : null,
    docsHref: docsUrl(),
    supportHref: withBasePath(routes.supportTickets()),
    onSignOut: () => performSignOut({ queryClient, router }),
  };
}

export function UserMenu() {
  const { ready, ...props } = useUserMenuProps();
  if (!ready || !props.user) {
    return (
      <span
        aria-hidden
        className="size-8 shrink-0 animate-pulse rounded-md border border-border/60 bg-muted"
      />
    );
  }
  return <HeaderUserMenu {...props} />;
}
