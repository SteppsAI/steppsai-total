import { Hono } from "hono";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../trpc/router";
import { createContext } from "../trpc/context";
import {
  getAuthInstance,
  authMiddleware,
  accessMiddleware,
} from "./helpers/auth-instance";
import { authRateLimiter, trpcRateLimiter } from "./helpers/rate-limiter";

export const App = new Hono<{
  Bindings: ServiceBindings & {
    AUTH_RATE_LIMITER: RateLimit;
    TRPC_RATE_LIMITER: RateLimit;
  };
  Variables: { userId: string };
}>();

// ========== PUBLIC: Auth routes ==========
App.on(["POST", "GET"], "/api/auth/*", authRateLimiter, async (c) => {
  try {
    const auth = await getAuthInstance(c.env, c.req.raw);
    return auth.handler(c.req.raw);
  } catch (error) {
    console.error("[AuthRoute] Error:", error);
    return c.json({ error: "auth_unavailable" }, 503);
  }
});

// ========== PUBLIC: tRPC (session-only) ==========
App.all(
  "/trpc/users.getMePublic",
  authMiddleware,
  (c) => {
    return fetchRequestHandler({
      endpoint: "/trpc",
      req: c.req.raw,
      router: appRouter,
      createContext: () =>
        createContext({
          req: c.req.raw,
          env: c.env,
          workerCtx: c.executionCtx,
          userId: c.get("userId"),
        }),
    });
  }
);

// ========== PROTECTED: tRPC routes ==========
App.all(
  "/trpc/*",
  authMiddleware,
  accessMiddleware,
  trpcRateLimiter,
  (c) => {
    return fetchRequestHandler({
      endpoint: "/trpc",
      req: c.req.raw,
      router: appRouter,
      createContext: () =>
        createContext({
          req: c.req.raw,
          env: c.env,
          workerCtx: c.executionCtx,
          userId: c.get("userId"),
        }),
    });
  }
);