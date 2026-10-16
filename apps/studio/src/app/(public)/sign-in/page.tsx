import {
  buildSignInUrl,
  defaultStudioReturnTo,
} from "@loftlancer/ui/auth-links";
import type { Route } from "next";
import { redirect } from "next/navigation";

/** Sign-in lives in the auth app; keep this URL as a redirect. */
export default function SignInPage() {
  redirect(buildSignInUrl({ returnTo: defaultStudioReturnTo() }) as Route);
}
