import type { Context } from "hono";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../trpc/router";
import { createContext } from "../../trpc/context";

type AppContext = Context<{
    Bindings: ServiceBindings & {
        AUTH_RATE_LIMITER: RateLimit;
        TRPC_RATE_LIMITER: RateLimit;
    };
    Variables: { userId: string };
}>;

/**
 * Create a tRPC handler with the given userId
 */
function createTrpcHandler(getUserId: (c: AppContext) => string) {
    return (c: AppContext) => {
        return fetchRequestHandler({
            endpoint: "/trpc",
            req: c.req.raw,
            router: appRouter,
            createContext: () =>
                createContext({
                    req: c.req.raw,
                    env: c.env,
                    workerCtx: c.executionCtx,
                    userId: getUserId(c),
                }),
        });
    };
}

/**
 * Handler for authenticated tRPC routes
 * Uses the userId from auth middleware
 */
export const authenticatedTrpcHandler = createTrpcHandler((c) => c.get("userId"));

/**
 * Handler for public/anonymous tRPC routes
 * Uses "anonymous" as userId
 */
export const publicTrpcHandler = createTrpcHandler(() => "anonymous");

/**
 * Public tRPC route patterns that don't require authentication
 * Order matters - more specific patterns should come first
 */
export const PUBLIC_TRPC_ROUTES = [
    "/trpc/publicGuides.*",
    "/trpc/webinar.*",
] as const;

/**
 * Semi-public tRPC routes that require session but not full access
 */
export const SESSION_ONLY_ROUTES = [
    "/trpc/users.getMePublic",
    "/trpc/config.getPublicConfig",
] as const;
