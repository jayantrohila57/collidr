import { Auth5Panel } from "@loftlancer/ui/patterns/auth-5";
import { Button } from "@loftlancer/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@loftlancer/ui/card";
import Link from "next/link";
import { Suspense } from "react";
import { GitHubSignInButton } from "@/components/github-sign-in-button";

export default function SignUpPage() {
  return (
    <Auth5Panel showTerms={false}>
      <Card className="w-full border-0 bg-transparent shadow-none before:hidden">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Loftlancer uses GitHub for sign-up and sign-in. Enterprise SSO is not
            enabled yet—your GitHub account is how we verify you.
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
    </Auth5Panel>
  );
}
