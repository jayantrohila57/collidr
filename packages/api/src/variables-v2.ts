import { env } from "@collidr/env/server";

export function isVariablesV2Enabled(): boolean {
  return env.VARIABLES_V2_ENABLED === "true";
}
