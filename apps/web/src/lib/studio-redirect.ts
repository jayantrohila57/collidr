import { DEFAULT_STUDIO_URL } from "@env-manager/env/platform";
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
  redirect(`${studioOrigin()}${path}`);
}
