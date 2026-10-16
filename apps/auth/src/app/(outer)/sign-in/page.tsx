import { Button } from "@loftlancer/ui/button";
import { Auth5Panel, AuthDivider } from "@loftlancer/ui/patterns/auth-5";
import { ChevronLeftIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { GitHubSignInButton } from "@/components/github-sign-in-button";
import { platformAuth } from "@/lib/platform-auth";
import {
  readSignInReturnTo,
  redirectIfAlreadySignedIn,
} from "./already-signed-in-redirect";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await platformAuth.api.getSession({
    headers: await headers(),
  });
  const params = await searchParams;
  if (session) {
    redirectIfAlreadySignedIn(await readSignInReturnTo(params));
  }

  return (
    <Auth5Panel
      title="Sign in or join Loftlancer"
      description="Use your GitHub account to sign in or create your Loftlancer account."
      topLeft={
        <Button variant="ghost" render={<a href="https://loftlancer.com/" />}>
          <ChevronLeftIcon aria-hidden />
          Home
        </Button>
      }
      footer={
        <>
          <AuthDivider>OR</AuthDivider>
          <div className="flex flex-col gap-2">
            <Button variant="outline" render={<Link href="/device" />}>
              Device sign-in (CLI)
            </Button>
            <Button variant="ghost" render={<Link href="/sign-up" />}>
              Create an account
            </Button>
          </div>
        </>
      }
    >
      <Suspense fallback={null}>
        <GitHubSignInButton />
      </Suspense>
    </Auth5Panel>
  );
}
