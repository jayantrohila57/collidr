import { DEFAULT_STUDIO_URL } from "@collidr/env/platform";
import type { Route } from "next";
import { redirect } from "next/navigation";

function studioOrigin(): string {
  return (process.env.NEXT_PUBLIC_STUDIO_URL ?? DEFAULT_STUDIO_URL).replace(
    /\/$/,
    "",
  );
}

/** Legacy web dashboard routes that now live on studio. */
export function redirectToStudio(pathname: string): never {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  redirect(`${studioOrigin()}${path}` as Route);
}
