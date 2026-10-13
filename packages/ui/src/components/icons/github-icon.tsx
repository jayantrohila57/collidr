import { createLucideIcon } from "lucide-react";

/** GitHub mark — lucide v1 removed brand icons; keep a local Lucide-compatible glyph. */
export const GithubIcon = createLucideIcon("Github", [
  [
    "path",
    {
      d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.01.28-2.12 0-3.1A5.403 5.403 0 0 0 20 4.55a8.067 8.067 0 0 0-4.5-1.3 8.182 8.182 0 0 0-6.5 2.7 8.067 8.067 0 0 0-1.5 4.72c0 3.1 2.5 5.5 5.5 5.5.39 0 .74-.04 1.1-.1a2.5 2.5 0 0 1 2.7 1.7 2.06 2.06 0 0 0 1.6 1.4 2.5 2.5 0 0 1 2.7-1.7c.36.06.71.1 1.1.1 3 0 5.5-2 5.5-5.5v-4",
      key: "1ef52a",
    },
  ],
]);

/** @deprecated Use `GithubIcon` — alias for older `Github` imports from lucide. */
export const Github = GithubIcon;
