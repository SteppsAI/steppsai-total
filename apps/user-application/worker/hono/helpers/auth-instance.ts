import { getAuth } from "@repo/data-ops/auth";


export const getAuthInstance = (env: ServiceBindings, req: Request) => {
    const backend = env.BACKEND_SERVICE as any;

    const url = new URL(req.url);
    const baseURL = `${url.protocol}//${url.host}`;

    try {
        if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
            console.error("[AuthInstance] Missing Google client env vars", {
                hasClientId: !!env.GOOGLE_CLIENT_ID,
                hasClientSecret: !!env.GOOGLE_CLIENT_SECRET,
            });
        }

        if (!env.BETTER_AUTH_SECRET) {
            console.error("[AuthInstance] Missing BETTER_AUTH_SECRET");
        }

        console.log("[AuthInstance] Creating Better Auth instance");

        const instance = getAuth(
            {
                clientId: env.GOOGLE_CLIENT_ID,
                clientSecret: env.GOOGLE_CLIENT_SECRET,
            },
            {
                apiKey: env.CREEM_API_KEY,
                webhookSecret: env.CREEM_WEBHOOK_SECRET,
            },
            env.BETTER_AUTH_SECRET,
            {
                sendResetPassword: async (email, name, url) => {
                    console.log("[AuthInstance] sendResetPassword", { email });
                    await backend.sendPasswordResetEmail(email, name, url);
                },
                sendVerificationEmail: async (email, name, url) => {
                    console.log("[AuthInstance] sendVerificationEmail", { email });
                    await backend.sendVerificationEmail(email, name, url);
                },
            },
            baseURL,
        );

        console.log("[AuthInstance] Better Auth instance created");
        return instance;
    } catch (error) {
        console.error("[AuthInstance] Failed to create auth instance", error);
        throw error;
    }
};