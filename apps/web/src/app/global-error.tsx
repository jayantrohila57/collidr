"use client";

import { useEffect } from "react";
import "../index.css";
import { Button } from "@/components/ui/button";

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
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="font-semibold text-2xl text-card-foreground">
            Application error
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Something went wrong. Please refresh the page or try again.
          </p>
          <Button type="button" onClick={reset} className="mt-6">
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
