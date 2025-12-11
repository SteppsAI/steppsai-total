import { getAuth } from "@repo/data-ops/auth";
import { createMiddleware } from "hono/factory";
import { checkSubscriptionAccess } from "@creem_io/better-auth/server";

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

  return getAuth(
    {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    {
      apiKey: env.CREEM_API_KEY,
      webhookSecret: env.CREEM_WEBHOOK_SECRET,
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
  Variables: { userId: string; auth: ReturnType<typeof getAuth> };
}>(async (c, next) => {
  const auth = await getAuthInstance(c.env, c.req.raw);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.text("Unauthorized", 401);
  }

  c.set("userId", session.user.id);
  c.set("auth", auth);
  await next();
});

// ============ ACCESS MIDDLEWARE (payment check) ============
export const accessMiddleware = createMiddleware<{
  Bindings: ServiceBindings;
  Variables: { userId: string; auth: ReturnType<typeof getAuth> };
}>(async (c, next) => {
  const auth = c.get("auth");
  const userId = c.get("userId");

  const status = await checkSubscriptionAccess(
    {
      apiKey: c.env.CREEM_API_KEY,
      testMode: c.env.CREEM_TEST_MODE === "true",
    },
    {
      database: auth.options.database,
      userId,
    }
  );

  if (!status.hasAccess) {
    return c.json({ error: "payment_required" }, 402);
  }

  await next();
});