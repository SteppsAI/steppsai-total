// worker/rate-limiter.ts
import { cloudflareRateLimiter } from "@hono-rate-limiter/cloudflare";
import type { MiddlewareHandler } from "hono";

// Pas dit type aan je eigen ServiceBindings aan
type Bindings = ServiceBindings & {
    AUTH_RATE_LIMITER: RateLimit;
    TRPC_RATE_LIMITER: RateLimit;
};

type Variables = {
    userId: string;
};

// Strenge limiter voor auth routes (/api/auth/*)
export const authRateLimiter: MiddlewareHandler<{
    Bindings: Bindings;
}> = cloudflareRateLimiter<{
    Bindings: Bindings;
}>({
    rateLimitBinding: (c) => c.env.AUTH_RATE_LIMITER,
    keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "",
    handler: (c) => c.text("Too many auth requests", 429),
});

// Ruimere limiter voor tRPC routes (/trpc/*)
export const trpcRateLimiter: MiddlewareHandler<{
    Bindings: Bindings;
    Variables: Variables;
}> = cloudflareRateLimiter<{
    Bindings: Bindings;
    Variables: Variables;
}>({
    rateLimitBinding: (c) => c.env.TRPC_RATE_LIMITER,
    keyGenerator: (c) => {
        const userId = c.get("userId");
        return userId ?? c.req.header("cf-connecting-ip") ?? "";
    },
    handler: (c) => c.text("Too many requests", 429),
});