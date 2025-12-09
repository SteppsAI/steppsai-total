import { createAuthClient } from "better-auth/react";
import { creemClient } from "@creem_io/better-auth/client";
import { WEB_APP_URL } from "./config";

export const authClient = createAuthClient({
    baseURL: WEB_APP_URL, // Points to user-application worker
    plugins: [creemClient()],
    session: {
        // In the extension we want the session to refresh automatically
        // after the user logs in from a separate tab.
        refetchOnWindowFocus: true,
        refetchInterval: 10_000, // re-check every 10s while side panel is open
        refetchOnReconnect: true,
    },
    logger: {
        disabled: false,
        level: "debug",
        log: (level: string, message: unknown, ...args: unknown[]) => {
            console.log(`[AuthClient][${level}]`, message, ...args);
        },
    },
});
