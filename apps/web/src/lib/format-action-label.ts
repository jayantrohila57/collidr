import { type ActionName, getActionDefinition } from "@collidr/actions";

export function formatActionLabel(action: string): string {
  try {
    const def = getActionDefinition(action as ActionName);
    if (def.description?.trim()) {
      return def.description.trim();
    }
  } catch {
    // Unknown action — fall through to slug formatting.
  }
  return action
    .split(".")
    .map((part) => part.replace(/_/g, " "))
    .join(" · ");
}
