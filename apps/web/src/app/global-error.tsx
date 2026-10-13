"use client";

import { useEffect } from "react";
import "../index.css";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var d=document.documentElement;var s=window.matchMedia("(prefers-color-scheme: dark)").matches;if(t==="dark"||(t!=="light"&&s))d.classList.add("dark");else d.classList.remove("dark");}catch(e){}})();`;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: theme bootstrap for error boundary
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="flex min-h-svh items-center justify-center bg-background p-6 font-sans text-foreground antialiased">
        <Card>
          <CardHeader>
            <CardTitle>Application error</CardTitle>
            <CardDescription>
              Something went wrong. Please refresh the page or try again.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button type="button" onClick={reset}>
              Try again
            </Button>
          </CardFooter>
        </Card>
      </body>
    </html>
  );
}
