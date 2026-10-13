import {
  buildSignInUrl,
  defaultConsoleReturnTo,
} from "@env-manager/ui/auth-links";

export function consoleSignInUrl(requestUrl?: string): string {
  const returnTo =
    requestUrl && requestUrl.startsWith("http")
      ? requestUrl
      : defaultConsoleReturnTo();
  return buildSignInUrl({ returnTo });
}
