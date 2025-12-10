import { Hono } from "hono";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../trpc/router";
import { createContext } from "../trpc/context";
import { getAuthInstance } from "./helpers/auth-instance";
import { authRateLimiter, trpcRateLimiter } from "./helpers/rate-limiter";
import { createMiddleware } from "hono/factory";

export const App = new Hono<{
    Bindings: ServiceBindings & {
        AUTH_RATE_LIMITER: RateLimit;
        TRPC_RATE_LIMITER: RateLimit;
    };
    Variables: { userId: string };
}>();

const authMiddleware = createMiddleware(async (c, next) => {
    // REMEMBER: reset before pushing (just for getting into the app locally)
    // Check for local development bypass
    const isLocalDev = c.req.header("x-local-dev-bypass") === "true";

    if (isLocalDev) {
        // Mock user for local development
        console.log("⚠️ Using mock user for local development");
        c.set("userId", "mock-user-id");
        await next();
        return;
    }

    const auth = getAuthInstance(c.env, c.req.raw);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) {
        return c.text("Unauthorized", 401);
    }
    c.set("userId", session.user.id);
    await next();
});

// ========== PUBLIC ROUTES ==========

App.on(["POST", "GET"], "/api/auth/*", authRateLimiter, (c) => {
    const auth = getAuthInstance(c.env, c.req.raw);
    return auth.handler(c.req.raw);
});

// ========== PROTECTED ROUTES ==========

App.all("/trpc/*", authMiddleware, trpcRateLimiter, (c) => {
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