/** Two-letter initials for avatars and badges (always length 2). */
export function initialsFromLabel(label: string, fallback = "PR") {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  const compact = (parts[0] ?? label).replace(/\s/g, "");
  if (compact.length >= 2) {
    return compact.slice(0, 2).toUpperCase();
  }
  if (compact.length === 1) {
    return `${compact[0]}${compact[0]}`.toUpperCase();
  }
  return fallback.slice(0, 2).toUpperCase();
}
