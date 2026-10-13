import { env } from "@env-manager/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
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

export const db = drizzle(pool, { schema });
