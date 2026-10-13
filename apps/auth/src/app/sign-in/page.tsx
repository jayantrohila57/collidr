import { Button } from "@collidr/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@collidr/ui/card";
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
            GitHub is the sign-in method for Collidr (enterprise SSO is not
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
          <Button variant="ghost" render={<Link href="/sign-up" />}>
            Create an account
          </Button>
        </CardPanel>
      </Card>
    </div>
  );
}
