/** Gate variables v2 (schema migration 0005). Keep false in prod until migration is applied. */
export function isVariablesV2Enabled(): boolean {
  return process.env.VARIABLES_V2_ENABLED === "true";
}
