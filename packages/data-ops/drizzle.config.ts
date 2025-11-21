import type { Config } from "drizzle-kit";

const config: Config = {
  out: "./src/drizzle-out",
  dialect: "postgresql",
  schema: ["./src/drizzle-out/auth-schema.ts", "./src/drizzle-out/schema.ts"],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
};

export default config satisfies Config;
