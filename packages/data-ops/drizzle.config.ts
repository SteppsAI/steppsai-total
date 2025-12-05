import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/drizzle-out",
  dialect: "postgresql",
  schema: ["./src/drizzle-out/auth-schema.ts", "./src/drizzle-out/schema.ts", "./src/drizzle-out/relations.ts"],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
