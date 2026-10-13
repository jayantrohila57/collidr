import { Button } from "@env-manager/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@env-manager/ui/card";
import Link from "next/link";
import { Suspense } from "react";
import { GitHubSignInButton } from "@/components/github-sign-in-button";

export default function SignInPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            GitHub is the sign-in method for Env Manager (enterprise SSO is not
            enabled yet).
          </CardDescription>
        </CardHeader>
        <CardPanel className="flex flex-col gap-4">
          <Suspense fallback={null}>
            <GitHubSignInButton />
          </Suspense>
          <Button variant="outline" render={<Link href="/device" />}>
            Device sign-in (CLI)
          </Button>
        </CardPanel>
      </Card>
    </div>
  );
}
