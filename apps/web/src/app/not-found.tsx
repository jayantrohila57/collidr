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
        <Button asChild>
          <Link href={"/" as Route}>Go home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={"/dashboard" as Route}>Open dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
