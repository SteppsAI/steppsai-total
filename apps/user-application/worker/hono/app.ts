import { Hono } from "hono";
import {
  getAuthInstance,
  authMiddleware,
  accessMiddleware,
} from "./helpers/auth-instance";
import { authRateLimiter, trpcRateLimiter, publicRateLimiter } from "./helpers/rate-limiter";
import {
  authenticatedTrpcHandler,
  publicTrpcHandler,
  PUBLIC_TRPC_ROUTES,
  SESSION_ONLY_ROUTES,
} from "./helpers/trpc-routes";

export const App = new Hono<{
  Bindings: ServiceBindings & {
    AUTH_RATE_LIMITER: RateLimit;
    TRPC_RATE_LIMITER: RateLimit;
  };
  Variables: { userId: string };
}>();

// ========== AUTH ROUTES ==========
App.on(["POST", "GET"], "/api/auth/*", authRateLimiter, async (c) => {
  try {
    const auth = await getAuthInstance(c.env, c.req.raw);
    return auth.handler(c.req.raw);
  } catch (error) {
    console.error("[AuthRoute] Error:", error);
    return c.json({
      error: "auth_unavailable",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, 503);
  }
});

// ========== PUBLIC TRPC ROUTES (no auth, IP rate limited) ==========
for (const route of PUBLIC_TRPC_ROUTES) {
  App.all(route, publicRateLimiter, publicTrpcHandler);
}

// ========== SESSION-ONLY TRPC ROUTES (auth required, no access check) ==========
for (const route of SESSION_ONLY_ROUTES) {
  App.all(route, authMiddleware, authenticatedTrpcHandler);
}

// ========== PROTECTED TRPC ROUTES (full auth + access check) ==========
App.all("/trpc/*", authMiddleware, accessMiddleware, trpcRateLimiter, authenticatedTrpcHandler);
