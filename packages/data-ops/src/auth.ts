import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db/database";
import {
    account,
    session,
    user,
    verification,
} from "./drizzle-out/auth-schema";
import { creem } from "@creem_io/better-auth";


let auth: ReturnType<typeof betterAuth>;

type CreemConfig = {
    apiKey: string;
    webhookSecret?: string;
    testMode?: boolean;
    defaultSuccessUrl?: string;
    persistSubscriptions?: boolean;
};

export function createBetterAuth(
    database: NonNullable<Parameters<typeof betterAuth>[0]>["database"],
    secret: string,
    creemConfig?: CreemConfig,
    google?: { clientId: string; clientSecret: string },
): ReturnType<typeof betterAuth> {
    return betterAuth({
        database,
        secret: secret,
        emailAndPassword: {
            enabled: false,
        },
        socialProviders: {
            google: {
                clientId: google?.clientId ?? "",
                clientSecret: google?.clientSecret ?? "",
            },
        },
        plugins: [
            creem({
                apiKey: creemConfig?.apiKey ?? process.env.CREEM_API_KEY!,
                webhookSecret: creemConfig?.webhookSecret ?? process.env.CREEM_WEBHOOK_SECRET,
                testMode: creemConfig?.testMode ?? true,
                defaultSuccessUrl: creemConfig?.defaultSuccessUrl ?? "/success",
                persistSubscriptions: creemConfig?.persistSubscriptions ?? true,
            }),
        ],
    });
}

export function getAuth(
    google: { clientId: string; clientSecret: string },
    creem: CreemConfig,
    secret: string,
): ReturnType<typeof betterAuth> {
    if (auth) return auth;

    auth = createBetterAuth(
        drizzleAdapter(getDb(), {
            provider: "pg",
            schema: {
                user,
                session,
                account,
                verification,
            },
        }),
        secret,
        creem,
        google,
    );
    return auth;
}