import type { ReactNode } from "react";

import { cn } from "../lib/utils";

/**
 * Adapted from the shadcn registry block `@efferd/auth-5`
 * (https://efferd.com/blocks/auth#auth-5). Only GitHub sign-in is backed by
 * real auth, so the Google/Apple buttons and email form are omitted; callers
 * pass the working action(s) as `children`.
 */
export function AuthDivider({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("relative flex w-full items-center", className)} {...props}>
      <div className="w-full border-t" />
      <div className="flex w-max justify-center text-nowrap px-2 text-muted-foreground text-xs">
        {children}
      </div>
      <div className="w-full border-t" />
    </div>
  );
}

export function Auth5Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold text-base tracking-tight", className)}>
      Loftlancer
    </span>
  );
}

export type Auth5PanelProps = {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  topLeft?: ReactNode;
  /** `page` fills the viewport (sign-in); `embed` fits inside a landing section. */
  variant?: "page" | "embed";
  className?: string;
  termsHref?: string;
  privacyHref?: string;
};

export function Auth5Panel({
  title = "Sign in or join Loftlancer",
  description = "Use your GitHub account to sign in or create your Loftlancer account.",
  children,
  footer,
  topLeft,
  variant = "page",
  className,
  termsHref = "https://loftlancer.com/terms",
  privacyHref = "https://loftlancer.com/privacy",
}: Auth5PanelProps) {
  const isPage = variant === "page";
  return (
    <div
      data-testid="auth-5"
      className={cn(
        "relative lg:grid lg:grid-cols-2",
        isPage
          ? "md:h-screen md:overflow-hidden"
          : "overflow-hidden rounded-xl border bg-background text-left shadow-sm",
        className,
      )}
    >
      <div className="relative hidden h-full flex-col border-r bg-secondary p-10 lg:flex dark:bg-secondary/20">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
        <Auth5Wordmark className="relative z-10 mr-auto" />
        <div className="relative z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl">
              &ldquo;Organizations, projects, environments and encrypted
              variables, all in one place for humans and agents.&rdquo;
            </p>
            <footer className="font-mono font-semibold text-sm">~ Loftlancer</footer>
          </blockquote>
        </div>
      </div>
      <div
        className={cn(
          "relative flex flex-col justify-center px-8",
          isPage ? "min-h-screen" : "py-14",
        )}
      >
        <div
          aria-hidden
          className="absolute inset-0 isolate -z-10 opacity-60 contain-strict"
        >
          <div className="absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]" />
          <div className="absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] [translate:5%_-50%]" />
        </div>
        {topLeft ? <div className="absolute top-7 left-5">{topLeft}</div> : null}
        <div className="mx-auto w-full space-y-4 sm:w-sm">
          <Auth5Wordmark className="lg:hidden" />
          <div className="flex flex-col space-y-1">
            <h1 className="font-bold font-heading text-2xl tracking-wide">{title}</h1>
            <p className="text-base text-muted-foreground">{description}</p>
          </div>
          <div className="space-y-2">{children}</div>
          {footer}
          <p className="mt-8 text-muted-foreground text-sm">
            By clicking continue, you agree to our{" "}
            <a className="underline underline-offset-4 hover:text-primary" href={termsHref}>
              Terms of Service
            </a>{" "}
            and{" "}
            <a className="underline underline-offset-4 hover:text-primary" href={privacyHref}>
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
