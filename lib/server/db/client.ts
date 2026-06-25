import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/lib/server/db/schema";
import { getServerEnv } from "@/lib/server/config/env";

type DbClient = ReturnType<typeof drizzle<typeof schema>>;

let pool: Pool | null = null;
let db: DbClient | null = null;

export function getDb(): DbClient {
  if (!db) {
    const env = getServerEnv();
    pool = new Pool({ connectionString: env.DATABASE_URL });
    db = drizzle(pool, { schema });
  }
  return db;
}

export async function closeDb() {
  await pool?.end();
  pool = null;
  db = null;
}
