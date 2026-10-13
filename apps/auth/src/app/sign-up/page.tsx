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

export default function SignUpPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Env Manager uses GitHub for sign-up and sign-in. Enterprise SSO is
            not enabled yet—your GitHub account is how we verify you.
          </CardDescription>
        </CardHeader>
        <CardPanel className="flex flex-col gap-4">
          <Suspense fallback={null}>
            <GitHubSignInButton label="Sign up with GitHub" />
          </Suspense>
          <p className="text-muted-foreground text-sm">
            Already have access? Use sign in instead.
          </p>
          <Button variant="outline" render={<Link href="/sign-in" />}>
            Sign in
          </Button>
        </CardPanel>
      </Card>
    </div>
  );
}
