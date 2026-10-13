import { buildSignInUrl } from "@env-manager/ui/auth-links";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { BookOpenIcon } from "lucide-react";

const GITHUB_REPO = "https://github.com/jayantrohila57/env-manager";

function studioUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_STUDIO_URL?.trim() ??
    "https://studio-env-manager.vercel.app";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <BookOpenIcon className="size-5 text-primary" />
          <span className="font-semibold">Env Manager Docs</span>
        </>
      ),
    },
    links: [
      {
        type: "button",
        text: "Studio",
        url: studioUrl(),
        external: true,
      },
      {
        type: "button",
        text: "Sign in",
        url: buildSignInUrl(),
        external: true,
      },
    ],
    githubUrl: GITHUB_REPO,
  };
}
