import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 text-center">
      <p className="font-semibold text-6xl text-muted-foreground">404</p>
      <h1 className="mt-4 font-semibold text-2xl">Page not found</h1>
      <p className="mt-2 max-w-md text-muted-foreground text-sm">
        The page you are looking for does not exist or you no longer have access
        to it.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <Button render={<Link href={"/" as Route} />}>Go home</Button>
        <Button
          variant="outline"
          render={<Link href={"/dashboard" as Route} />}
        >
          Open dashboard
        </Button>
      </div>
    </div>
  );
}
