## Creem + BetterAuth Payments Implementation Plan (SteppsAI)

> Goal: Users must complete a paid “lifetime deal” (Creem checkout) before they can access `/app`, using BetterAuth + Creem with DB persistence and webhook‑driven access control. Later we can add more products/plans without changing the core flow.

---

### 1. Align schema + BetterAuth Creem configuration

1. **Adopt Creem’s DB model via BetterAuth plugin**
   - Keep existing `users` table (`auth-schema.ts`).
   - Continue to let the Creem plugin manage its own `creem_subscription` table via BetterAuth migrations.
   - **Do not** repurpose our current `subscriptions` table; treat it as app‑specific (e.g. summary/limits) that can read from `creem_subscription` when needed.
2. **Verify / update BetterAuth Creem options in `packages/data-ops/src/auth.ts`**
   - Ensure we pass:
     - `apiKey` (prod key, and test key in dev).
     - `webhookSecret`.
     - `persistSubscriptions: true`.
     - `defaultSuccessUrl` pointing to our app worker (e.g. `/auth/lifetime/success`).
   - Add `onGrantAccess` and `onRevokeAccess` handlers later if we want to mirror state into our `subscriptions` table or `users` table.
3. **Run BetterAuth migrations (once)**
   - Use `@better-auth/cli migrate` against the same DB and connection used by `getDb()`.
   - Confirm `creem_subscription` table exists and matches the docs.

### 2. Webhook wiring (BACKEND_SERVICE + BetterAuth)

1. **Confirm webhook endpoint**
   - External webhook URL: `BACKEND_SERVICE/api/auth/creem/webhook` (matches Creem dashboard).
   - Ensure this path is actually proxied to BetterAuth:
     - If the auth server is the **user‑application worker**, consider switching the webhook to that domain’s `/api/auth/creem/webhook`.
     - Otherwise, expose a small proxy in the BACKEND_SERVICE that forwards raw requests to the BetterAuth instance.
2. **Environment variables**
   - BACKEND_SERVICE env:
     - `CREEM_API_KEY`
     - `CREEM_WEBHOOK_SECRET`
   - Ensure the same values are available to wherever `getAuth` is called (`user-application` worker via `ServiceBindings`).
3. **Validation**
   - Use Creem’s test webhook delivery to verify:
     - Signature is accepted (no 401).
     - BetterAuth logs of Creem plugin show events.
     - `creem_subscription` rows are created/updated.

### 3. Lifetime checkout flow (frontend, BetterAuth client)

1. **Route for the deal**
   - New route: `/auth/lifetime` (or name we choose) that:
     - Requires a logged‑in user; if not logged in, redirect to `/auth/login?from=/auth/lifetime`.
     - Renders a slightly adapted `BlackFridayDeal` component:
       - Add a small “Welcome to SteppsAI, {user.name}” text (no broader design changes).
2. **Hooking the CTA to Creem**
   - Use `authClient.creem.createCheckout` with:
     - `productId`: choose based on region (US vs EU product IDs; e.g. via small selector or IP‑based heuristic later).
     - `successUrl`: `/app` (or `/auth/lifetime/success` that then redirects to `/app`).
     - Optional: `metadata: { referenceId: session.user.id, source: "lifetime_launch" }`.
   - Redirect the user to `data.url` when returned.
3. **Multiple product IDs (US/EU)**
   - Start simple: one primary product ID for now, and keep both IDs in config:
     - `VITE_CREEM_PRODUCT_US`
     - `VITE_CREEM_PRODUCT_EU`
   - Later we can:
     - Ask user for region on the page (simple toggle).
     - Or infer region from billing address that Creem collects (no app changes needed).

### 4. Access gating: “payment done” requirement

We want to follow the Creem plugin’s **access model**, not roll our own.

1. **Client‑side access check**
   - Use `authClient.creem.hasAccessGranted()` as the primary way to know if the user has an active / lifetime product.
   - Add a small cache helper (similar to `getSessionCached`) in `router.tsx`:
     - `getAccessStatusCached()` → returns `{ hasAccess, status, expiresAt }`.
2. **Route guard for `/app`**
   - In `/app/_authed.tsx` `beforeLoad`:
     - Get session via `getSessionCached()`.
     - If no session → redirect to `/auth/login`.
     - If session but `!hasAccess` (via `getAccessStatusCached`) → redirect to `/auth/lifetime`.
     - Else allow access.
3. **Server‑side gating (tRPC / backend)**
   - In `apps/user-application/worker/hono/app.ts`:
     - After session check in `authMiddleware`, call Creem server utility `checkSubscriptionAccess` using:
       - `apiKey` and `testMode` from env.
       - `database: auth.options.database` (BetterAuth DB adapter).
       - `userId: session.user.id`.
     - If `!status.hasAccess`, return 403 (or 402 Payment Required) for `/trpc/*`.
   - This mirrors the docs and ensures unauthorized users cannot call APIs even if they bypass the UI.

### 5. Customer Portal integration (settings.tsx)

1. **Wire the “View Billing Info” button**
   - In the Billing section of `settings.tsx`:
     - Add `isLoadingPortal` state.
     - On click:
       - Call `authClient.creem.createPortal()`.
       - Optionally handle `{ error }` with a toast.
       - Let the plugin redirect the user to the Creem portal (same tab).
2. **Display basic subscription info**
   - Option (simple): call `authClient.creem.hasAccessGranted()` on settings load and show:
     - “Lifetime access” if access is granted and `status` indicates the one‑time deal product.
   - Option (later): add a TRPC `users.getSubscription` query that reads from `creem_subscription` or our `subscriptions` table for richer UI (renewal date, plan name, etc.).

### 6. Optional: mirror subscription into `subscriptions` table

> Only if we need extra app‑level features like seat limits per plan.

1. **Extend `subscriptions` table if needed**
   - Keep current fields but ensure it can map from Creem:
     - `planType` (e.g. `"lifetime"`, `"pro_monthly"`, etc.).
     - `status` (mirrors Creem status).
     - `maxEditors` etc. remain app‑specific.
2. **Use `onGrantAccess` / `onRevokeAccess` in BetterAuth config**
   - Implement handlers in `getAuth`:
     - `onGrantAccess`: upsert to `subscriptions` for `userId`, set `planType`, `status`, `currentPeriodEnd`, etc.
     - `onRevokeAccess`: mark `status` as inactive, clear limits if needed.
   - This keeps our app‑level table always in sync with Creem events (driven by webhooks).

### 7. Testing checklist (following docs)

1. **Local / staging**
   - Use test API key + webhook secret.
   - Run BetterAuth migrations; verify `creem_subscription` exists.
   - Create a test user, run through:
     - Sign up → login → redirect to `/auth/lifetime`.
     - Click “Get Lifetime Access” → Creem checkout → complete payment.
   - Verify:
     - `hasAccessGranted` returns `hasAccess: true`.
     - `/app` routes now load; `/trpc` calls succeed.
2. **Webhook**
   - In Creem dashboard, send test events to the webhook URL.
   - Confirm:
     - 2xx responses.
     - `creem_subscription` rows updated.
     - Optional: `subscriptions` table updated via handlers.
3. **Portal**
   - On settings page, click “View Billing Info”.
   - Confirm Creem portal opens and shows subscription / lifetime purchase.

---

### 8. Open questions / decisions

1. **Route naming**: Final URL for lifetime page (`/auth/lifetime` vs `/auth/upgrade` vs `/launch-special`).
2. **Region selection**: For US/EU products, do we:
   - Ask user explicitly on the page, or
   - Hard‑code one for now (e.g. US), using EU only for certain locales later?
3. **When to introduce `subscriptions` mirroring**:
   - Immediately (for future features like seat limits), or
   - Later, after the basic pay‑to‑access flow is stable?

Once these are decided, we can implement step‑by‑step in small PR‑sized chunks following this plan.

