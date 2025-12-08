import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle-out/schema";
import * as authSchema from "../drizzle-out/auth-schema";

let connectionString: string | null = null;

export function initDatabase(connString: string) {
  connectionString = connString;
}

export function getDb() {
  const connStr = connectionString ?? process.env.DATABASE_URL;
  
  if (!connStr) {
    throw new Error("Database not initialized and DATABASE_URL not found");
  }

  // Create fresh connection per request (required for CF Workers)
  const client = postgres(connStr, { prepare: false });
  return drizzle(client, { schema: { ...schema, ...authSchema }, logger: true });
}