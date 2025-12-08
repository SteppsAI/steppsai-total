import { Hono } from "hono";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../trpc/router";
import { createContext } from "../trpc/context";
import { getAuth } from "@repo/data-ops/auth";
import { createMiddleware } from "hono/factory";

export const App = new Hono<{
    Bindings: ServiceBindings;
    Variables: { userId: string };
}>();

const getAuthInstance = (env: ServiceBindings) => {
    return getAuth(
        {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
        {
            apiKey: env.CREEM_API_KEY,
            webhookSecret: env.CREEM_WEBHOOK_SECRET,
        },
        env.BETTER_AUTH_SECRET
    );
};

const authMiddleware = createMiddleware(async (c, next) => {
    const auth = getAuthInstance(c.env);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) {
        return c.text("Unauthorized", 401);
    }
    c.set("userId", session.user.id);
    await next();
});

// ========== PUBLIC ROUTES ==========

// Auth routes (Better Auth handler)
App.on(["POST", "GET"], "/api/auth/*", (c) => {
    const auth = getAuthInstance(c.env);
    return auth.handler(c.req.raw);
});

// ========== PROTECTED ROUTES ==========

// tRPC → data-ops (DB) + RPC bindings (R2, DOs, Queues) + browser-extension
App.all("/trpc/*", authMiddleware, (c) => {
    const userId = c.get("userId");
    return fetchRequestHandler({
        endpoint: "/trpc",
        req: c.req.raw,
        router: appRouter,
        createContext: () =>
            createContext({
                req: c.req.raw,
                env: c.env,
                workerCtx: c.executionCtx,
                userId,
            }),
    });
});

