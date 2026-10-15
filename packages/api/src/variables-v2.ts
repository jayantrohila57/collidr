import { env } from "@loftlancer/env/server";

export function isVariablesV2Enabled(): boolean {
  return env.VARIABLES_V2_ENABLED === "true";
}
