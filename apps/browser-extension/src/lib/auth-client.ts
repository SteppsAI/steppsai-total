import { createAuthClient } from "better-auth/react";
import { creemClient } from "@creem_io/better-auth/client";
import { WEB_APP_URL } from "./config";

export const authClient = createAuthClient({
    baseURL: WEB_APP_URL, // Points to user-application worker
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
