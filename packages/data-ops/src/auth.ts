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

type EmailSender = {
    sendResetPassword?: (email: string, name: string, url: string) => Promise<void>;
    sendVerificationEmail?: (email: string, name: string, url: string) => Promise<void>;
};

export function createBetterAuth(
    database: NonNullable<Parameters<typeof betterAuth>[0]>["database"],
    secret: string,
    creemConfig?: CreemConfig,
    google?: { clientId: string; clientSecret: string },
    emailSender?: EmailSender,
): ReturnType<typeof betterAuth> {
    return betterAuth({
        database,
        secret: secret,
        emailAndPassword: {
            enabled: true,
            sendResetPassword: emailSender?.sendResetPassword
                ? async ({ user, url }) => {
                    await emailSender.sendResetPassword!(user.email, user.name ?? '', url);
                }
                : undefined,
        },
        emailVerification: emailSender?.sendVerificationEmail
            ? {
                sendVerificationEmail: async ({ user, url }) => {
                    await emailSender.sendVerificationEmail!(user.email, user.name ?? '', url);
                },
            }
            : undefined,
        socialProviders: {
            google: {
                clientId: google?.clientId ?? "",
                clientSecret: google?.clientSecret ?? "",
            },
        },
        plugins: [
            creem({
                apiKey: creemConfig?.apiKey ?? "",
                webhookSecret: creemConfig?.webhookSecret ?? "",
                testMode: creemConfig?.testMode ?? true,
                defaultSuccessUrl: creemConfig?.defaultSuccessUrl ?? "/success",
                persistSubscriptions: creemConfig?.persistSubscriptions ?? true,
            }),
        ],
        // Generate UUIDs instead of default strings to match database schema
        generateId: () => {
            return crypto.randomUUID();
        },
    });
}

export function getAuth(
    google: { clientId: string; clientSecret: string },
    creem: CreemConfig,
    secret: string,
    emailSender?: EmailSender,
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
        emailSender,
    );
    return auth;
}