import type React from "react";
import type { ReactNode } from "react";

import { cn } from "../lib/utils";

/**
 * Full-page layout from the shadcn registry block `@efferd/auth-5`
 * (https://efferd.com/blocks/auth#auth-5, https://efferd.com/r/auth-5.json).
 * Markup and Tailwind classes follow the block. Differences:
 * - Loftlancer wordmark + quote instead of the Efferd logo/testimonial.
 * - Only real auth actions are rendered (GitHub); Google/Apple/email omitted.
 * - `FloatingPaths` is not published in the registry (r/floating-paths.json
 *   404s), so a CSS-animated SVG equivalent is inlined below.
 */

export function AuthDivider({
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className="relative flex w-full items-center" {...props}>
      <div className="w-full border-t" />
      <div className="flex w-max justify-center text-nowrap px-2 text-muted-foreground text-xs">
        {children}
      </div>
      <div className="w-full border-t" />
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold text-base leading-none tracking-tight",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" aria-hidden className="size-4.5 fill-current">
        <path d="M3 21V9l9-6 9 6v12h-6v-7H9v7H3z" />
      </svg>
      Loftlancer
    </span>
  );
}

export function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));
  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-foreground"
        fill="none"
        viewBox="0 0 696 316"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeOpacity={0.1 + path.id * 0.03}
            strokeWidth={path.width}
            pathLength={1}
            strokeDasharray="0.3 0.7"
            className="motion-safe:animate-[auth5-path_20s_linear_infinite]"
            style={{ animationDelay: `${-path.id * 0.6}s` }}
          />
        ))}
      </svg>
      <style>{"@keyframes auth5-path{to{stroke-dashoffset:-1}}"}</style>
    </div>
  );
}

export type Auth5PanelProps = {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Rendered under the actions (e.g. AuthDivider + secondary links). */
  footer?: ReactNode;
  /** Top-left ghost button slot (the block's "Home" link). */
  topLeft?: ReactNode;
  /** Top-right slot (theme toggle). */
  topRight?: ReactNode;
  showTerms?: boolean;
  termsHref?: string;
  privacyHref?: string;
};

export function Auth5Panel({
  title,
  description,
  children,
  footer,
  topLeft,
  topRight,
  showTerms = true,
  termsHref = "https://loftlancer.com/terms",
  privacyHref = "https://loftlancer.com/privacy",
}: Auth5PanelProps) {
  return (
    <main
      data-testid="auth-5"
      className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2"
    >
      <div className="relative hidden h-full flex-col border-r bg-secondary p-10 lg:flex dark:bg-secondary/20">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
        <Logo className="relative z-10 mr-auto h-4.5" />

        <div className="z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl">
              &ldquo;Loftlancer keeps our organizations, projects and encrypted
              environment variables in one place, for our team and our
              agents.&rdquo;
            </p>
            <footer className="font-mono font-semibold text-sm">
              ~ The Loftlancer team
            </footer>
          </blockquote>
        </div>
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>
      <div className="relative flex min-h-screen flex-col justify-center px-8">
        {/* Top Shades */}
        <div
          aria-hidden
          className="absolute inset-0 isolate -z-10 opacity-60 contain-strict"
        >
          <div className="absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]" />
          <div className="absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]" />
        </div>
        {topLeft ? (
          <div className="absolute top-7 left-5">{topLeft}</div>
        ) : null}
        {topRight ? (
          <div className="absolute top-7 right-5">{topRight}</div>
        ) : null}

        <div className="mx-auto space-y-4 sm:w-sm">
          <Logo className="h-4.5 lg:hidden" />
          {title || description ? (
            <div className="flex flex-col space-y-1">
              {title ? (
                <h1 className="font-bold font-heading text-2xl tracking-wide">
                  {title}
                </h1>
              ) : null}
              {description ? (
                <p className="text-base text-muted-foreground">{description}</p>
              ) : null}
            </div>
          ) : null}
          <div className="space-y-2">{children}</div>
          {footer}
          {showTerms ? (
            <p className="mt-8 text-muted-foreground text-sm">
              By clicking continue, you agree to our{" "}
              <a
                className="underline underline-offset-4 hover:text-primary"
                href={termsHref}
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                className="underline underline-offset-4 hover:text-primary"
                href={privacyHref}
              >
                Privacy Policy
              </a>
              .
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}

/** GitHub mark from the block's `@efferd/github-icon` registry item. */
export function GithubMark(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 438.549 438.549" {...props}>
      <path
        d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
        fill="currentColor"
      />
    </svg>
  );
}
