import { env } from "@env-manager/env/web";

/** Client flag — enable only with server migration 0005 + VARIABLES_V2_ENABLED. */
export function isVariablesV2EnabledOnClient(): boolean {
  return env.NEXT_PUBLIC_VARIABLES_V2_ENABLED === "true";
}
