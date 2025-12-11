# Creem + BetterAuth Implementation Plan v2

## Architecture Overview

```
packages/data-ops/src/
├── auth.ts                    # BetterAuth config (already done ✅)

apps/user-application/
├── src/
│   ├── lib/
│   │   └── auth-helpers.ts    # Session + Access caching (NEW)
│   ├── components/auth/
│   │   └── client.ts          # authClient (already done ✅)
│   ├── routes/
│   │   ├── payment/
│   │   │   ├── success.tsx    # Payment success page (NEW)
│   │   │   └── cancel.tsx     # Payment cancel page (NEW)
│   │   └── app/
│   │       ├── _authed.tsx    # Route guard (UPDATE)
│   │       ├── upgrade.tsx    # Upgrade page (UPDATE)
│   │       └── settings.tsx   # Settings with portal (UPDATE)
│   └── router.tsx             # Clean up - remove auth helpers (UPDATE)
│
├── worker/
│   └── hono/
│       ├── app.ts             # Routes only (UPDATE)
│       └── helpers/
│           └── auth-instance.ts # Auth + middleware (UPDATE)
```

---

## File Changes

### 1. NEW: `src/lib/auth-helpers.ts`

Consolidate all session/access logic here.

```typescript
import { authClient } from "@/components/auth/client";

// ============ SESSION CACHE ============
let sessionCache: { data: any; timestamp: number } | null = null;
const SESSION_CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export async function getSessionCached() {
  const now = Date.now();
  if (sessionCache && now - sessionCache.timestamp < SESSION_CACHE_TTL) {
    return sessionCache.data;
  }
  const session = await authClient.getSession();
  sessionCache = { data: session, timestamp: now };
  return session;
}

export function clearSessionCache() {
  sessionCache = null;
}

// ============ ACCESS CACHE ============
let accessCache: { hasAccess: boolean; timestamp: number } | null = null;
const ACCESS_CACHE_TTL = 1000 * 60 * 2; // 2 minutes

export async function getAccessCached(): Promise<boolean> {
  const now = Date.now();
  if (accessCache && now - accessCache.timestamp < ACCESS_CACHE_TTL) {
    return accessCache.hasAccess;
  }

  try {
    const result = await authClient.creem.hasAccessGranted();
    const hasAccess = (result as any)?.data?.hasAccess ?? false;
    accessCache = { hasAccess, timestamp: now };
    return hasAccess;
  } catch (error) {
    console.error("[AuthHelpers] Access check failed:", error);
    return false;
  }
}

export function clearAccessCache() {
  accessCache = null;
}

// ============ CLEAR ALL ============
export function clearAllAuthCaches() {
  clearSessionCache();
  clearAccessCache();
}
```

---

### 2. UPDATE: `src/router.tsx`

Remove auth helpers, import from `auth-helpers.ts`.

```typescript
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

import { routeTree } from "./routeTree.gen";
import type { AppRouter } from "@/worker/trpc/router";
import Pending from "@/components/common/pending";
import { ErrorComponent } from "@/components/common/error-boundary";

// Re-export for convenience
export {
  getSessionCached,
  getAccessCached,
  clearSessionCache,
  clearAccessCache,
  clearAllAuthCaches,
} from "@/lib/auth-helpers";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: "/trpc" })],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});

export function createRouter() {
  return createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    context: { trpc, queryClient },
    defaultPendingComponent: () => <Pending />,
    defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
    Wrap: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
```

---

### 3. UPDATE: `worker/hono/helpers/auth-instance.ts`

Add `authMiddleware` and `accessMiddleware` here.

```typescript
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
```

---

### 4. UPDATE: `worker/hono/app.ts`

Clean routes only, import middleware.

```typescript
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
```

---

### 5. NEW: `src/routes/payment/success.tsx`

```typescript
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { clearAccessCache } from "@/lib/auth-helpers";

export const Route = createFileRoute("/payment/success")({
  component: PaymentSuccessPage,
});

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Clear cache so next check fetches fresh access status
    clearAccessCache();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate({ to: "/app" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8 max-w-md">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold">Payment Successful!</h1>
        <p className="text-muted-foreground">
          Welcome to SteppsAI. Redirecting in {countdown}...
        </p>
        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
      </div>
    </div>
  );
}
```

---

### 6. NEW: `src/routes/payment/cancel.tsx`

```typescript
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payment/cancel")({
  component: PaymentCancelPage,
});

function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8 max-w-md">
        <XCircle className="h-16 w-16 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold">Payment Cancelled</h1>
        <p className="text-muted-foreground">
          No worries — you can try again whenever you're ready.
        </p>
        <Button onClick={() => navigate({ to: "/app/upgrade" })}>
          Back to Upgrade
        </Button>
      </div>
    </div>
  );
}
```

---

### 7. UPDATE: `src/routes/app/_authed.tsx`

```typescript
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { getSessionCached, getAccessCached } from "@/lib/auth-helpers";
// ... other imports

export const Route = createFileRoute("/app/_authed")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    // 1. Session check
    const session = await getSessionCached();
    if (!session.data?.session) {
      throw redirect({ to: "/auth/login" });
    }

    // 2. Access check (skip for upgrade page)
    const isUpgradePage = location.pathname === "/app/upgrade";
    if (!isUpgradePage) {
      const hasAccess = await getAccessCached();
      if (!hasAccess) {
        throw redirect({ to: "/app/upgrade" });
      }
    }
  },
});

// ... rest of component unchanged
```

---

### 8. UPDATE: `src/routes/app/upgrade.tsx`

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/router";
import { authClient } from "@/components/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/upgrade")({
  component: UpgradePage,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.users.getMe.queryOptions()
    );
  },
});

function UpgradePage() {
  const { data: user } = useSuspenseQuery(trpc.users.getMe.queryOptions());
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const result = await authClient.creem.createCheckout({
        productId: import.meta.env.VITE_CREEM_LIFETIME_PRODUCT,
        successUrl: "/payment/success",
      });

      const url = (result as any)?.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Could not start checkout");
      }
    } catch (error) {
      console.error("[Upgrade] Checkout error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          {user?.name ? `Welcome, ${user.name}!` : "Welcome!"}
        </h1>
        <p className="text-muted-foreground">
          One payment. Lifetime access. All future updates.
        </p>
      </div>

      <div className="bg-card border rounded-2xl p-8 w-full max-w-sm space-y-6">
        <div className="text-center">
          <span className="text-4xl font-bold">$49</span>
          <p className="text-sm text-muted-foreground">one-time</p>
        </div>

        <ul className="text-sm space-y-2">
          <li>✓ Unlimited guides</li>
          <li>✓ PDF & HTML export</li>
          <li>✓ All future updates</li>
        </ul>

        <Button
          className="w-full"
          size="lg"
          onClick={handleCheckout}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Get Lifetime Access
        </Button>
      </div>
    </div>
  );
}
```

---

### 9. UPDATE: `src/routes/app/_authed/settings.tsx`

Update portal handler:

```typescript
// Add this handler
const handlePortal = async () => {
  try {
    const res = await authClient.creem.createPortal();
    const url = (res as any)?.data?.url;
    if (url) {
      window.location.href = url;
    } else {
      toast.error("Could not open billing portal");
    }
  } catch {
    toast.error("Failed to open billing portal");
  }
};

// Update the button in Billing section:
<Button variant="outline" className="gap-2" onClick={handlePortal}>
  <CreditCard className="h-4 w-4" />
  Manage Billing
</Button>
```

---

## Environment Variables

```bash
# .dev.vars (local)
CREEM_API_KEY=creem_test_xxx
CREEM_WEBHOOK_SECRET=whsec_xxx
CREEM_TEST_MODE=true

# Vite env
VITE_CREEM_LIFETIME_PRODUCT=prod_xxx
```

---

## AI Agent Instructions

```markdown
## Task: Implement Creem Payment Flow

### Order of operations:
1. Create `src/lib/auth-helpers.ts` (copy from plan)
2. Update `src/router.tsx` (remove inline caches, re-export from auth-helpers)
3. Update `worker/hono/helpers/auth-instance.ts` (add middlewares)
4. Update `worker/hono/app.ts` (import middlewares, clean up)
5. Create `src/routes/payment/success.tsx`
6. Create `src/routes/payment/cancel.tsx`
7. Update `src/routes/app/_authed.tsx` (add access check)
8. Update `src/routes/app/upgrade.tsx` (checkout flow)
9. Update `src/routes/app/_authed/settings.tsx` (portal handler)

### Rules:
- Do NOT modify `packages/data-ops/src/auth.ts` — it's already correct
- Use exact imports from the plan
- Keep error handling minimal but present
- Test each file compiles before moving to next
- The payment pages (/payment/*) should NOT be protected routes

### Testing checklist:
- [ ] Unauthenticated user → redirected to /auth/login
- [ ] Authenticated user without payment → redirected to /app/upgrade
- [ ] Checkout button → redirects to Creem
- [ ] After payment → /payment/success → /app
- [ ] /trpc/* returns 402 if no access
- [ ] Settings portal button opens Creem portal
```

---

Want me to adjust anything or add more detail to specific sections?