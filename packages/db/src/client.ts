import { env } from "@env-manager/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl:
    env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: true,
        }
      : undefined,
});

export const db = drizzle(pool, { schema });
