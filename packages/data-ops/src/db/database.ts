import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle-out/schema";
import * as authSchema from "../drizzle-out/auth-schema";

let db: ReturnType<typeof drizzle<typeof schema & typeof authSchema>>;

export function initDatabase(connectionString: string) {
  const client = postgres(connectionString);
  db = drizzle(client, { schema: { ...schema, ...authSchema } });
}

export function getDb() {
  if (!db) {
    // Fallback for local dev or if init hasn't been called yet, though ideally it should be.
    // For now, we'll throw if not initialized, or we could try to init from env if available.
    if (process.env.DATABASE_URL) {
      initDatabase(process.env.DATABASE_URL);
    } else {
      throw new Error("Database not initialized and DATABASE_URL not found");
    }
  }
  return db;
}

