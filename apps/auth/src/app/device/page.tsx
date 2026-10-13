import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@env-manager/ui/card";
import Link from "next/link";

export default function DevicePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Device sign-in</CardTitle>
          <CardDescription>
            Run the Env Manager CLI to obtain a device code, then sign in here
            to approve it. Device authorization is enabled on this auth app
            (Better Auth device flow).
          </CardDescription>
        </CardHeader>
        <CardPanel className="text-sm">
          <p className="text-muted-foreground">
            After signing in with GitHub, open the verification URL shown in
            your terminal and enter the user code when prompted.
          </p>
          <Link href="/sign-in" className="mt-4 inline-block underline">
            Sign in with GitHub
          </Link>
        </CardPanel>
      </Card>
    </div>
  );
}
