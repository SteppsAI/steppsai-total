# Auth Middleware Migration Plan (Bearer Token)

## Overview

Using Better Auth's **Bearer plugin** for service-to-service authentication:

1. **user-application** - Has Better Auth configured, validates user sessions
2. **data-service** - Validates Bearer token via Better Auth's `getSession`

The browser sends session cookie → user-application validates → passes Bearer token to data-service → data-service validates the token.

---

## Architecture

```
Browser (cookie) → user-application → data-service → DB/R2
                         ↓                   ↓
                   getSession()         getSession()
                   extracts userId      validates Bearer token
                   passes to data-service
```

**Key Insight:** Since both services share the same database (via `@repo/data-ops`), they can both use the same Better Auth instance to validate sessions.

---

## Implementation

### Step 1: Add Bearer plugin to auth config

**File: `packages/data-ops/auth-gen/auth.ts`**

Add the bearer plugin:
```typescript
import { bearer } from "better-auth/plugins";

export function getAuth(...) {
    return betterAuth({
        // ...existing config
        plugins: [
            bearer(),  // ADD THIS
            creem({ ... }),
        ],
    });
}
```

---

### Step 2: data-service - Add auth middleware

**File: `apps/data-service/src/hono/app.ts`**

```typescript
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { getAuth } from '@repo/data-ops/auth';

export const App = new Hono<{ 
    Bindings: Env;
    Variables: { userId: string };
}>();

// Auth middleware - validates Bearer token
const authMiddleware = createMiddleware(async (c, next) => {
    const auth = getAuth(
        { clientId: c.env.GOOGLE_CLIENT_ID, clientSecret: c.env.GOOGLE_CLIENT_SECRET },
        { apiKey: c.env.CREEM_API_KEY },
        c.env.BETTER_AUTH_SECRET
    );
    
    const session = await auth.api.getSession({ 
        headers: c.req.raw.headers 
    });
    
    if (!session?.user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    
    c.set('userId', session.user.id);
    await next();
});

// Apply to protected routes
App.use('/guides/*', authMiddleware);
App.use('/users/*', authMiddleware);
App.use('/exports/*', authMiddleware);
App.use('/api/editor/*', authMiddleware);

// Routes (no changes needed to route files)
App.route('/guides', guidesRouter);
App.route('/users', usersRouter);
// etc...
```

---

### Step 3: data-service - Add env vars to wrangler.jsonc

**File: `apps/data-service/wrangler.jsonc`**

Add the same auth env vars as user-application:
```jsonc
"vars": {
    // existing...
    "GOOGLE_CLIENT_ID": "",
    "GOOGLE_CLIENT_SECRET": "",
    "CREEM_API_KEY": "",
    "BETTER_AUTH_SECRET": ""
}
```

---

### Step 4: data-service - Update service-bindings.d.ts

**File: `apps/data-service/service-bindings.d.ts`**

```typescript
interface Env extends Cloudflare.Env {
    // existing...
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    CREEM_API_KEY: string;
    BETTER_AUTH_SECRET: string;
}
```

---

### Step 5: data-service routes - Use c.var.userId

**File: `apps/data-service/src/hono/routes/guides.ts`**

Change:
```typescript
// REMOVE THIS
const HARDCODED_USER_ID = 'f1d84914-ec7c-4b1a-9a89-eaeff6b2f366';

// USE THIS INSTEAD
guidesRouter.post('/start', async (c) => {
    const userId = c.var.userId;  // from middleware
    // ...
});
```

---

### Step 6: user-application - Pass Authorization header

**File: `apps/user-application/worker/trpc/routers/guides.ts`**

The user-application already has the session token. Pass it via Authorization header:

```typescript
delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
        const response = await ctx.env.BACKEND_SERVICE.fetch(
            new Request(`https://internal/guides/${input.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': ctx.req.headers.get('Authorization') || '',
                    // OR pass the session cookie
                    'Cookie': ctx.req.headers.get('Cookie') || '',
                },
            })
        );
        // ...
    }),
```

---

## Simplified Alternative: Trust the Frontend Headers

Since user-application → data-service is an internal call via Cloudflare Service Bindings, we can simply pass the original request headers:

```typescript
// user-application: Just forward the original headers
const response = await ctx.env.BACKEND_SERVICE.fetch(
    new Request(`https://internal/guides/${input.id}`, {
        method: 'DELETE',
        headers: ctx.req.headers  // Forward all headers (including cookies)
    })
);
```

Then data-service's `auth.api.getSession({ headers })` will automatically read the cookies/bearer token.

---

## Files to Modify

| File | Action |
|------|--------|
| `packages/data-ops/auth-gen/auth.ts` | Add bearer plugin |
| `apps/data-service/wrangler.jsonc` | Add auth env vars |
| `apps/data-service/service-bindings.d.ts` | Add auth env types |
| `apps/data-service/src/hono/app.ts` | Add auth middleware |
| `apps/data-service/src/hono/routes/guides.ts` | Use c.var.userId |
| `apps/data-service/src/hono/routes/users.ts` | Use c.var.userId |
| `apps/data-service/src/hono/routes/editor.ts` | Use c.var.userId |
| `apps/data-service/src/hono/routes/exports.ts` | Use c.var.userId |
| `apps/user-application/worker/trpc/routers/*.ts` | Forward headers |

---

## Checklist

- [ ] Add bearer plugin to auth config
- [ ] Add auth env vars to data-service wrangler.jsonc
- [ ] Add auth env types to data-service service-bindings.d.ts
- [ ] Add auth middleware to data-service app.ts
- [ ] Update guides.ts route - remove hardcoded userId
- [ ] Update users.ts route - remove hardcoded userId
- [ ] Update editor.ts route - if has hardcoded userId
- [ ] Update exports.ts route - if has hardcoded userId
- [ ] Update user-application routers to forward headers
