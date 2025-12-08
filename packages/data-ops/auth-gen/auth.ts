import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "../src/db/database";
import * as authSchema from "../src/drizzle-out/auth-schema";

type BetterAuthInstance = ReturnType<typeof betterAuth>;

export function getAuth(
): BetterAuthInstance {
    return betterAuth({
        database: drizzleAdapter(getDb(), {
            provider: "pg",
            schema: { ...authSchema },
        }),
    }) as BetterAuthInstance;
}

export const auth: BetterAuthInstance = getAuth();
