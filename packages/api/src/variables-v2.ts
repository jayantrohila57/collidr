import { env } from "@env-manager/env/server";

export function isVariablesV2Enabled(): boolean {
  return env.VARIABLES_V2_ENABLED === "true";
}
