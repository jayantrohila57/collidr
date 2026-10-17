import type { ReactNode } from "react";

/**
 * Page title + prose body. The surrounding chrome comes from the route-group
 * layout: auth-5 split for (split) pages, the public app-shell for (legal).
 */
export function MarketingPage({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <header>
        <h1 className="text-balance font-semibold text-2xl tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-muted-foreground text-sm">{description}</p>
        ) : null}
      </header>
      <div className="mt-8 space-y-4 text-foreground/90 text-sm leading-relaxed [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_h2]:mt-10 [&_h2]:font-medium [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:tracking-tight [&_p]:leading-relaxed">
        {children}
      </div>
    </div>
  );
}
