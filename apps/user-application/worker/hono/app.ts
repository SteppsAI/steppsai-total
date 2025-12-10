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
    const auth = await getAuthInstance(c.env, c.req.raw);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) {
        return c.text("Unauthorized", 401);
    }
    c.set("userId", session.user.id);
    await next();
});

// ========== PUBLIC ROUTES ==========

App.on(["POST", "GET"], "/api/auth/*", authRateLimiter, async (c) => {
    try {
        const auth = await getAuthInstance(c.env, c.req.raw);
        return auth.handler(c.req.raw);
    } catch (error) {
        console.error("[AuthRoute] Failed to handle /api/auth/* request", error);
        return c.json(
            {
                error: "auth_unavailable",
                message: "Authentication is temporarily unavailable. Please try again later.",
            },
            503,
        );
    }
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