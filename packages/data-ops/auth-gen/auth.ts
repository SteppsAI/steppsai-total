import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { creem } from "@creem_io/better-auth";
import { getDb } from "../src/db/database";
import * as authSchema from "../src/drizzle-out/auth-schema";

type BetterAuthInstance = ReturnType<typeof betterAuth>;

export function getAuth(
    googleConfig: { clientId: string; clientSecret: string },
    creemConfig: { apiKey: string; webhookSecret?: string },
    secret: string
): BetterAuthInstance {
    return betterAuth({
        database: drizzleAdapter(getDb(), {
            provider: "pg",
            schema: { ...authSchema },
        }),
        secret,
        socialProviders: {
            google: {
                clientId: googleConfig.clientId,
                clientSecret: googleConfig.clientSecret,
            },
        },
        emailAndPassword: {
            enabled: true,
        },
        plugins: [
            creem({
                apiKey: creemConfig.apiKey,
                webhookSecret: creemConfig.webhookSecret,
                testMode: true,
            }),
        ],
    }) as BetterAuthInstance;
}
