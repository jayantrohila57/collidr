import { env } from "@env-manager/env/web";

export function isVariablesV2EnabledOnClient(): boolean {
  return env.NEXT_PUBLIC_VARIABLES_V2_ENABLED === "true";
}
