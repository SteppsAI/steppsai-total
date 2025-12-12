import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { creem } from "@creem_io/better-auth";
import { getDb } from "../src/db/database";
import * as authSchema from "../src/drizzle-out/auth-schema";

type BetterAuthInstance = ReturnType<typeof betterAuth>;

/**
 * Auth config used **only** by the BetterAuth CLI to generate Drizzle schema.
 *
 * It must include the same plugins (Creem) that we use at runtime so that
 * plugin tables like `creem_subscription` are generated.
 */
export function getAuth(): BetterAuthInstance {
    return betterAuth({
        database: drizzleAdapter(getDb(), {
            provider: "pg",
            schema: { ...authSchema },
        }),
        plugins: [
            creem({
                // Values are not important for schema generation, so we fall back to dummy strings
                apiKey: process.env.CREEM_API_KEY ?? "dummy",
                webhookSecret: process.env.CREEM_WEBHOOK_SECRET,
                testMode: true,
                persistSubscriptions: true,
            }),
        ],
    }) as BetterAuthInstance;
}

export const auth: BetterAuthInstance = getAuth();
export default auth;
