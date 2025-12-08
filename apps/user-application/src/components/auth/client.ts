import { createAuthClient } from "better-auth/react";
import { creemClient } from "@creem_io/better-auth/client";


export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_AUTH_URL,
    plugins: [creemClient()],
    session: {
        refetchOnWindowFocus: false,
        refetchInterval: false,
        refetchOnReconnect: false,
    },
    logger: {
        disabled: false,
        level: "debug",
        log: (level: string, message: unknown, ...args: unknown[]) => {
            console.log(`[AuthClient][${level}]`, message, ...args);
        },
    },
});

