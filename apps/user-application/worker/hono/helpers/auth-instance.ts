import { getAuth } from "@repo/data-ops/auth";
import { createMiddleware } from "hono/factory";

// Inline helper to check user access - supports both subscriptions and one-time orders
async function checkUserAccessLocal(auth: ReturnType<typeof getAuth>, userId: string): Promise<{
  hasAccess: boolean;
  status: string | null;
}> {
  try {
    // Query the creem_subscription table directly using the auth database adapter
    const db = auth.options.database;
    
    // Use adapter's findOne method to query
    const subscription = await db.findOne({
      model: "creemSubscription",
      where: [{ field: "referenceId", value: userId }],
    });
    
    if (!subscription) {
      console.log(`[checkUserAccessLocal] No subscription/order found for user ${userId}`);
      return { hasAccess: false, status: null };
    }
    
    console.log(`[checkUserAccessLocal] Found record with status: ${subscription.status}`);
    
    // Active statuses that grant access
    const activeStatuses = ["active", "trialing", "paid"];
    const hasAccess = activeStatuses.includes(subscription.status ?? "");
    
    // For one-time orders (no periodEnd), access is permanent
    // For subscriptions, check if within billing period
    if (subscription.periodEnd) {
      const expiresAt = new Date(subscription.periodEnd);
      if (expiresAt < new Date() && !activeStatuses.includes(subscription.status ?? "")) {
        console.log(`[checkUserAccessLocal] Subscription expired at ${expiresAt}`);
        return { hasAccess: false, status: subscription.status };
      }
    }
    
    return { hasAccess, status: subscription.status };
  } catch (error) {
    console.error(`[checkUserAccessLocal] Error checking access:`, error);
    return { hasAccess: false, status: null };
  }
}

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

  // Use our custom access check that supports both subscriptions and one-time orders
  const status = await checkUserAccessLocal(auth, userId);

  if (!status.hasAccess) {
    console.log(`[AccessMiddleware] Access denied for user ${userId}, status: ${status.status}`);
    return c.json({ error: "payment_required" }, 402);
  }

  console.log(`[AccessMiddleware] Access granted for user ${userId}`);
  await next();
});