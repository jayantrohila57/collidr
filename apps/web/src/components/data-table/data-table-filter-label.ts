/** Title/sentence-case labels for filter UI; raw enum values stay unchanged for queries. */
export function formatDataTableFilterLabel(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (normalized === "bulk_import") return "Bulk import";
  if (normalized === "updated-desc") return "Updated (newest)";
  if (normalized === "updated-asc") return "Updated (oldest)";
  if (normalized === "name-asc") return "Name (A–Z)";
  if (normalized === "name-desc") return "Name (Z–A)";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
