import { VersionBadge } from "@loftlancer/ui/patterns/version-badge";
import { cn } from "@loftlancer/ui/utils";

const LINKS = [
  { label: "Docs", href: "/docs" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Changelog", href: "/changelog" },
  { label: "Status", href: "/status" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;

/** Compact public-site footer: page links and the product version (#368, #369). */
export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1.5 text-muted-foreground text-xs",
        className,
      )}
    >
      <nav aria-label="Site" className="flex flex-wrap gap-x-3 gap-y-1.5">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-foreground"
          >
            {link.label}
          </a>
        ))}
      </nav>
      <VersionBadge className="ml-auto" />
    </footer>
  );
}
