import { getAuth } from "@repo/data-ops/auth";
import { createMiddleware } from "hono/factory";
import { checkUserAccess } from "@repo/data-ops/queries/subscriptions";
import { initDatabase } from "@repo/data-ops/database";


// ============ AUTH INSTANCE ============
let healthCache: { ok: boolean; timestamp: number } | null = null;
const HEALTH_CACHE_TTL = 60 * 1000; // 60 seconds

export const getAuthInstance = async (env: ServiceBindings, req: Request) => {
  const backend = env.BACKEND_SERVICE as any;
  const url = new URL(req.url);
  const baseURL = `${url.protocol}//${url.host}`;

  // Health check with caching
  const now = Date.now();
  if (!healthCache || (now - healthCache.timestamp > HEALTH_CACHE_TTL)) {
    try {
      const health = await backend.authHealthCheck();
      // Update cache
      healthCache = {
        ok: !!health?.ok,
        timestamp: now
      };
    } catch (e) {
      console.error("[AuthInstance] Health check failed", e);

      throw new Error("Auth infrastructure unavailable");
    }
  }

  if (!healthCache?.ok) {
    throw new Error("Auth infrastructure unavailable");
  }

  // Check for critical variables
  if (!env.CREEM_WEBHOOK_SECRET) {
    console.warn("[AuthInstance] WARNING: CREEM_WEBHOOK_SECRET is not set! Webhooks will fail.");
  }
  if (!env.CREEM_API_KEY) {
    console.error("[AuthInstance] CRITICAL: CREEM_API_KEY is not set! Checkout will fail.");
  }

  return getAuth(
    {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    {
      apiKey: env.CREEM_API_KEY,
      webhookSecret: env.CREEM_WEBHOOK_SECRET,
      testMode: env.VITE_AUTH_URL !== "https://stepps.ai",
    },
    env.BETTER_AUTH_SECRET,
    {
      sendResetPassword: (email, name, url) =>
        backend.sendPasswordResetEmail(email, name, url),
      sendVerificationEmail: (email, name, url) =>
        backend.sendVerificationEmail(email, name, url),
    },
    baseURL
  );
};

// ============ AUTH MIDDLEWARE (session check) ============
export const authMiddleware = createMiddleware<{
  Bindings: ServiceBindings;
  Variables: { userId: string; auth: ReturnType<typeof getAuth>; databaseUrl: string };
}>(async (c, next) => {
  const auth = await getAuthInstance(c.env, c.req.raw);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.text("Unauthorized", 401);
  }

  c.set("userId", session.user.id);
  c.set("auth", auth);
  c.set("databaseUrl", c.env.DATABASE_URL);
  await next();
});

// ============ ACCESS MIDDLEWARE (payment check) ============
export const accessMiddleware = createMiddleware<{
  Bindings: ServiceBindings;
  Variables: { userId: string; auth: ReturnType<typeof getAuth>; databaseUrl: string };
}>(async (c, next) => {
  const userId = c.get("userId");
  const databaseUrl = c.get("databaseUrl");

  // Check if request is for whitelisted public procedures (even if batched)
  const url = new URL(c.req.url);
  // Remove /trpc/ prefix and split by comma for batching
  const path = url.pathname.replace(/^\/trpc\//, "");
  const procedures = path.split(",");

  const publicProcedures = ["users.getMePublic", "config.getPublicConfig"];
  const isPublic = procedures.every(p => publicProcedures.includes(p));

  if (isPublic) {
    console.log(`[AccessMiddleware] Allowing public procedures: ${procedures.join(", ")}`);
    await next();
    return;
  }

  // Initialize database and use the same checkUserAccess as tRPC routes
  await initDatabase(databaseUrl);
  const accessResult = await checkUserAccess(userId);

  if (!accessResult.hasAccess) {
    console.log(`[AccessMiddleware] Access denied for user ${userId}, status: ${accessResult.status}`);
    return c.json({ error: "payment_required" }, 402);
  }

  console.log(`[AccessMiddleware] Access granted for user ${userId}`);
  await next();
});