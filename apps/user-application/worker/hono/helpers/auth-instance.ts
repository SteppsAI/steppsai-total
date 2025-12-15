import { getAuth } from "@repo/data-ops/auth";
import { createMiddleware } from "hono/factory";
import { checkUserAccess } from "@repo/data-ops/queries/subscriptions";
import { initDatabase } from "@repo/data-ops/database";

// ============ AUTH INSTANCE ============
export const getAuthInstance = async (env: ServiceBindings, req: Request) => {
  const backend = env.BACKEND_SERVICE as any;
  const url = new URL(req.url);
  const baseURL = `${url.protocol}//${url.host}`;

  // Health check
  const health = await backend.authHealthCheck();
  if (!health?.ok) {
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