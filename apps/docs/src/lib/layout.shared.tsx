import { buildSignInUrl } from "@collidr/ui/auth-links";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { BookOpenIcon } from "lucide-react";

const GITHUB_REPO = "https://github.com/jayantrohila57/collidr";

function studioUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_STUDIO_URL?.trim() ??
    "https://collidr.vercel.app/studio";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <BookOpenIcon className="size-5 text-primary" />
          <span className="font-semibold">Collidr Docs</span>
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
