import { createAuthClient } from "better-auth/react";
import { creemClient } from "@creem_io/better-auth/client";
import { WEB_APP_URL } from "./config";

export const authClient = createAuthClient({
    baseURL: WEB_APP_URL, // Points to user-application worker
    plugins: [creemClient()],
});
