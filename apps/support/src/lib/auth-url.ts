import {
  buildSignInUrl,
  defaultSupportReturnTo,
} from "@env-manager/ui/auth-links";

export function supportSignInUrl(requestUrl?: string): string {
  const returnTo =
    requestUrl && requestUrl.startsWith("http")
      ? requestUrl
      : defaultSupportReturnTo();
  return buildSignInUrl({ returnTo });
}
