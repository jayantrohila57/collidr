import { encrypt } from "@env-manager/crypto";
import { and, eq, inArray } from "drizzle-orm";

import { db } from "./client";
import { E2E_DEMO_VAR_KEY } from "./e2e-demo-project";
import { environmentVariable } from "./schema/projects";
import { activeEnvironmentVariableWhere } from "./soft-delete";

/** Marker in notes/values so seeded rows are obviously non-production. */
export const E2E_DEMO_SEED_MARKER = "fake-dev-only";

const FAKE_SECRET_SAMPLE = "sample-fake-secret-not-real";
const FAKE_CONFIG_SAMPLE = "sample-config-value";

export type E2eDemoVariableDef = {
  key: string;
  type: "secret" | "config";
  value: string;
  note: string;
};

export const E2E_DEMO_VARIABLE_DEFS: E2eDemoVariableDef[] = [
  {
    key: E2E_DEMO_VAR_KEY,
    type: "config",
    value: "playwright-local-demo-value",
    note: `${E2E_DEMO_SEED_MARKER}: E2E assertion key`,
  },
  {
    key: "APP_URL",
    type: "config",
    value: "https://e2e-demo.example.dev",
    note: `${E2E_DEMO_SEED_MARKER}: public base URL`,
  },
  {
    key: "LOG_LEVEL",
    type: "config",
    value: "debug",
    note: `${E2E_DEMO_SEED_MARKER}: local log level`,
  },
  {
    key: "DATABASE_URL",
    type: "secret",
    value: FAKE_SECRET_SAMPLE,
    note: `${E2E_DEMO_SEED_MARKER}: postgres placeholder`,
  },
  {
    key: "API_TOKEN",
    type: "secret",
    value: FAKE_CONFIG_SAMPLE,
    note: `${E2E_DEMO_SEED_MARKER}: service token placeholder`,
  },
];

/**
 * Inserts missing demo variables for the E2E development environment (idempotent).
 */
export async function seedE2eDemoVariables(
  environmentId: string,
  createdBy?: string,
) {
  const keys = E2E_DEMO_VARIABLE_DEFS.map((def) => def.key);

  const existing = await db
    .select({ key: environmentVariable.key })
    .from(environmentVariable)
    .where(
      activeEnvironmentVariableWhere(
        and(
          eq(environmentVariable.environmentId, environmentId),
          inArray(environmentVariable.key, keys),
        ),
      ),
    );

  const existingKeys = new Set(existing.map((row) => row.key));

  for (const def of E2E_DEMO_VARIABLE_DEFS) {
    if (existingKeys.has(def.key)) {
      continue;
    }

    await db.insert(environmentVariable).values({
      id: crypto.randomUUID(),
      key: def.key,
      encryptedValue: encrypt(def.value),
      type: def.type,
      note: def.note,
      environmentId,
      createdBy: createdBy ?? null,
      updatedBy: createdBy ?? null,
    });
  }
}
