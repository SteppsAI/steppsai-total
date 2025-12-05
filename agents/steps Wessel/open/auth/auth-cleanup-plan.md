# Auth & Routes - Current State and Cleanup Plan

## CURRENT MESS - What I Created

I created duplicate code in multiple places. Here's what exists:

### user-application/worker/hono/routes/ (NEW - maybe not needed?)
- `guides.ts` - DELETE routes that call BACKEND_SERVICE
- `users.ts` - avatar routes that call BACKEND_SERVICE
- `exports.ts` - trigger route
- `editor.ts` - session routes
- `recording.ts` - recording routes

### user-application/worker/trpc/routers/ (EXISTING - also has BACKEND_SERVICE calls)
- `guides.ts` - has delete mutations with BACKEND_SERVICE.fetch
- `users.ts` - has avatar mutations with BACKEND_SERVICE.fetch
- `exports.ts` - has trigger mutation with BACKEND_SERVICE.fetch
- `editor.ts` - has session mutations with BACKEND_SERVICE.fetch
- `recording.ts` - has mutations with BACKEND_SERVICE.fetch

### data-service/src/hono/routes/ (EXISTING - the actual backend)
- Already has all the route handlers

---

## WHAT YOU PROBABLY WANT

**Option A: tRPC routers call data-service directly**
- tRPC routers use `ctx.env.BACKEND_SERVICE.fetch()` directly
- No need for user-application/worker/hono/routes/
- Auth handled by middleware in user-application/worker/hono/app.ts

**Option B: tRPC routers call user-application Hono routes, which call data-service**
- Extra layer of abstraction
- More files, more complexity

---

## FILES TO DELETE (if Option A)

Delete the entire folder:
- `apps/user-application/worker/hono/routes/`

Remove imports from `apps/user-application/worker/hono/app.ts`

---

## FILES TO FIX

### user-application/worker/trpc/routers/*.ts
- Remove `throw new Error("Unauthorized")` checks (middleware handles this)
- Use `ctx.userInfo.userId` (not ctx.userId)
- Keep `ctx.env.BACKEND_SERVICE.fetch()` calls

### data-service/src/hono/routes/*.ts 
- Remove hardcoded `HARDCODED_USER_ID`
- Use `c.var.userId` from middleware (if data-service has auth middleware)
- OR receive userId from request body/headers

### data-service/src/hono/app.ts
- Add auth middleware that validates session
- Set `c.var.userId`

---

## WHAT DO YOU WANT?

Please tell me:
1. Delete the new `user-application/worker/hono/routes/` folder?
2. Keep tRPC routers calling BACKEND_SERVICE directly?
3. How should data-service validate auth? (via Better Auth session from forwarded headers?)
