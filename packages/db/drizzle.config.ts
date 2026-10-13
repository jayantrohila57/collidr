import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

import { normalizeDatabaseSslModeInUrl } from "./src/connection-url";

dotenv.config({
  path: "../../apps/web/.env",
});

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";

export default defineConfig({
  schema: "./src/schema",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: normalizeDatabaseSslModeInUrl(databaseUrl),
  },
});
