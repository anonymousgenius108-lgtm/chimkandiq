import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const databaseUrl =
  process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "SUPABASE_DATABASE_URL or DATABASE_URL must be set. Did you forget to configure a database?",
  );
}

const isSupabaseDatabase =
  databaseUrl.includes(".supabase.co") ||
  databaseUrl.includes(".supabase.com");

export const pool = new Pool({
  connectionString: databaseUrl,
  ...(isSupabaseDatabase ? { ssl: true } : {}),
});
export const db = drizzle(pool, { schema });

export * from "./schema";
