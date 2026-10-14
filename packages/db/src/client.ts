import { env } from "@collidr/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { resolveDatabaseConnectionString } from "./connection-url";
import * as schema from "./schema";

const connectionString = resolveDatabaseConnectionString(
  env.DATABASE_URL,
  env.DATABASE_URL_POOLED,
);

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 20_000,
  keepAlive: true,
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
