import { env } from "@env-manager/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { resolveDatabaseConnectionString } from "./connection-url";
import * as schema from "./schema";

const connectionString = resolveDatabaseConnectionString(env.DATABASE_URL);

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  ssl:
    env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: true,
        }
      : undefined,
});

if (env.NODE_ENV === "production") {
  void pool.query("SELECT 1").catch(() => {
    // Warm pool on cold start; failures retry on first real query.
  });
}

export const db = drizzle(pool, { schema });
