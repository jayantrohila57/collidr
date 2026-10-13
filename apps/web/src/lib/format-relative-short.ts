import { formatDate } from "@/lib/format";

/** Compact relative time for stat cards (avoids wrapping e.g. "8 months ago"). */
export function formatRelativeShort(value: Date | string | number): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days < 1) return "Today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 30) {
    const weeks = Math.max(1, Math.floor(days / 7));
    return `${weeks}w ago`;
  }
  if (days < 365) {
    const months = Math.max(1, Math.floor(days / 30));
    return `${months}mo ago`;
  }

  return formatDate(date, { month: "short", year: "numeric" });
}
