"use client";

import { useEffect } from "react";

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
    <html lang="en">
      <body className="flex min-h-svh items-center justify-center bg-white p-6 font-sans text-neutral-900">
        <div className="max-w-md text-center">
          <h1 className="font-semibold text-2xl">Application error</h1>
          <p className="mt-2 text-neutral-600 text-sm">
            Something went wrong. Please refresh the page or try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-md bg-neutral-900 px-4 py-2 text-sm text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
