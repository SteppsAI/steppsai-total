# Public guide visibility and API key settings implementation plan

Validated against the current codebase on 2026-03-25.

## Goal
Ship two product fixes without changing the generated guide/docs editing flow:

1. `published` means "shareable by direct link", not "listed on the public website".
2. Only guides with `visibility = 'public'` should appear on the public Stepps `/guides` page.
3. Users need a real `Settings -> API` surface to create, list, and revoke Stepps agent API keys.
4. API key management must be owner-only.
5. The public `/docs` reference must point to the real product flow: create a key in `Settings -> API`, then use that key for agent setup.

## Product contract
Use this model consistently everywhere:

- `draft`: not shareable, never listed
- `published + private`: shareable by `/shared/:guideId`, not listed on public `/guides`
- `published + public`: shareable by link and listed on public `/guides`

Important consequences:

- Do not treat `published` as public website listing.
- Do not treat `shareGuide` as `visibility = 'public'`.
- Do not change `getPublishedGuide(guideId)` to require `visibility = 'public'`, or private shared links will break.
- API keys are owner credentials. Team access is not enough to manage them.

## Verified current state
These points are confirmed in the codebase, not inferred:

### Public listing leak
- [`packages/data-ops/src/queries/guides.ts`](/Users/wernerjohannesdieben/steppsai-total/packages/data-ops/src/queries/guides.ts) `getAllPublishedGuides()` currently filters only `status = 'published'`.
- [`apps/user-application/worker/hono/app.ts`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/hono/app.ts) uses that query for sitemap generation.
- [`apps/user-application/worker/trpc/routers/public-guides.ts`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/trpc/routers/public-guides.ts) also uses that query for the public guides page.

### Agent runs still force public visibility
- [`apps/data-service/src/rpc-methods/agent-api.ts`](/Users/wernerjohannesdieben/steppsai-total/apps/data-service/src/rpc-methods/agent-api.ts) creates new agent guides with `visibility: input.output.shareGuide ? "public" : "private"`.
- The same file also sets `visibility: run.output.shareGuide ? "public" : "private"` in both:
  - `completeAgentRunFromBrowser(...)`
  - `completeAgentRunForOwner(...)`
- That means changing only `createAgentRun(...)` is not enough. The completion flows would still leak guides publicly.

### Share dialog gap
- [`apps/user-application/src/components/share-dialog.tsx`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/share-dialog.tsx) only tracks `status`.
- The current copy implies publish = public.
- Current call sites pass status, but not visibility.

### API key product gap
- REST API key endpoints already exist in [`apps/user-application/worker/hono/routes/agent-api.ts`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/hono/routes/agent-api.ts).
- There is no Settings UI for API keys in [`apps/user-application/src/routes/app/_authed/settings.tsx`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/app/_authed/settings.tsx).
- The session-authenticated API key REST routes currently rely on auth + access, but not owner-only enforcement.

### Docs mismatch
- [`apps/user-application/src/lib/agent-api-docs.ts`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/lib/agent-api-docs.ts) still says "dashboard" instead of `Settings -> API`.
- The same docs file currently describes browser-session setup as website-session auth.
- The real route implementation in [`apps/user-application/worker/hono/routes/agent-api.ts`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/hono/routes/agent-api.ts) shows:
  - `POST /api/agent/v1/browser-sessions/pairing-tokens` uses bearer auth
  - `GET /api/agent/v1/browser-sessions` uses bearer auth

## Scope and non-goals

### In scope
- Fix public guide listing semantics.
- Stop agent runs from auto-making guides public.
- Add owner-only API key management to the app.
- Align `/docs` with the real settings and auth flow.
- Update the share dialog so share-by-link and public listing are separate controls.

### Out of scope
- No schema changes or DB migration.
- No changes to generated docs content or editor workflow.
- No redesign of the broader guides dashboard.
- No change to the public REST contract except stricter owner enforcement on existing session-authenticated key routes.

### Related files that should not be changed for this task
- [`apps/user-application/src/routes/app/_authed/docs/$guideId.tsx`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/app/_authed/docs/$guideId.tsx)
- [`apps/user-application/src/routes/shared/docs/$guideId.tsx`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/shared/docs/$guideId.tsx)
- [`apps/user-application/src/routes/app/_authed/editor/$guideId.tsx`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/app/_authed/editor/$guideId.tsx) except for passing `guideVisibility` into `ShareDialog`

## Workstream 1: Public listing semantics

### 1.1 Patch the public listing query
File:
- [`packages/data-ops/src/queries/guides.ts`](/Users/wernerjohannesdieben/steppsai-total/packages/data-ops/src/queries/guides.ts)

Change:
- Update `getAllPublishedGuides()` so it filters on both:
  - `status = 'published'`
  - `visibility = 'public'`

Keep unchanged:
- `getPublishedGuide(guideId)`

Why:
- `getAllPublishedGuides()` is the public-listing query used by both the public guides page and sitemap generation.
- `getPublishedGuide()` is the direct-link query and must still allow `published + private`.

Expected outcome:
- `/guides` only shows intentionally public guides.
- `/shared/:guideId` still works for private-but-published guides.
- sitemap stops indexing private published guides.

### 1.2 Stop agent runs from forcing public visibility
File:
- [`apps/data-service/src/rpc-methods/agent-api.ts`](/Users/wernerjohannesdieben/steppsai-total/apps/data-service/src/rpc-methods/agent-api.ts)

Required changes:
- In `createAgentRun(...)`, change the initial guide creation from:
  - `visibility: input.output.shareGuide ? "public" : "private"`
- To:
  - `visibility: "private"`

Also required:
- In `completeAgentRunFromBrowser(...)`, stop deriving `visibility` from `run.output.shareGuide`.
- In `completeAgentRunForOwner(...)`, stop deriving `visibility` from `run.output.shareGuide`.

Recommended implementation:
- Keep `status` based on `shareGuide`:
  - `shareGuide === true` -> `status: "published"`
  - `shareGuide === false` -> `status: "draft"`
- Do not overwrite `visibility` during completion.
- Let the guide remain private until the user explicitly changes visibility from the product UI.

Why:
- `shareGuide` should control whether a shared URL is available.
- It should not control public website discoverability.

Important note:
- This is the most important correction versus the earlier rough plan. If only `createAgentRun(...)` changes, the completion path will still flip guides to public.

## Workstream 2: Separate share-by-link from public listing in the UI

### 2.1 Update the share dialog
File:
- [`apps/user-application/src/components/share-dialog.tsx`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/share-dialog.tsx)

Changes:
- Add prop:
  - `guideVisibility?: 'public' | 'private' | null`
- Track `internalVisibility` alongside `internalStatus`.
- Keep the publish mutation for status.
- Add a second mutation using `trpc.guides.update` to toggle `visibility`.

Recommended dialog behavior:
- If not published:
  - Show that the guide is not shareable yet.
  - Disable public website listing controls until publish.
- If published:
  - Show the direct share URL.
  - Show a separate control for "Listed on stepps.ai website".

Recommended copy:
- Draft state:
  - `This guide is not shareable yet. Publish it to enable a direct share link.`
- Published state:
  - `This guide is shareable by link. Public website listing is controlled separately below.`
- Public listing help text:
  - `Turn this on only if you want the guide discoverable on the public Stepps guides page.`

Recommended state model:
- `isPublished = internalStatus === 'published'`
- `isPubliclyListed = internalVisibility === 'public'`
- Reset both internal states from props when the dialog reopens.

Recommended invalidation:
- `trpc.guides.getById`
- `trpc.guides.getAll`
- `trpc.publicGuides.getAllPublished`

### 2.2 Pass visibility into every share dialog call site
Files:
- [`apps/user-application/src/routes/app/_authed/editor/$guideId.tsx`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/app/_authed/editor/$guideId.tsx)
- [`apps/user-application/src/routes/app/_authed/stepps/$guideId.tsx`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/app/_authed/stepps/$guideId.tsx)
- [`apps/user-application/src/routes/app/_authed/stepps/index.tsx`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/app/_authed/stepps/index.tsx)
- [`apps/user-application/src/routes/app/_authed/folder/$folderId.tsx`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/app/_authed/folder/$folderId.tsx)
- [`apps/user-application/src/components/dashboard/recent-stepps.tsx`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/dashboard/recent-stepps.tsx)

Changes:
- Pass `guide.visibility` through to `ShareDialog`.
- Update local `selectedGuide` state shapes where needed so they carry:
  - `id`
  - `title`
  - `status`
  - `visibility`

Why:
- Without the current visibility value, the dialog cannot accurately render or toggle listing state.

### 2.3 Explicitly accept the existing UX boundary
Existing pages already have separate visibility controls:
- [`apps/user-application/src/routes/app/_authed/stepps/index.tsx`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/app/_authed/stepps/index.tsx)
- [`apps/user-application/src/routes/app/_authed/folder/$folderId.tsx`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/app/_authed/folder/$folderId.tsx)

For this task:
- Do not redesign those views.
- Accept that they may still allow pre-setting `visibility` on draft guides.
- The actual listing contract still remains correct because `/guides` will require both `published` and `public`.

Risk:
- This creates a small UX inconsistency with the share dialog if the dialog disables public listing until publish. That is acceptable for this task and can be cleaned up later.

## Workstream 3: Add owner-only API key management to the app

### 3.1 Add internal tRPC router for Settings
New file:
- [`apps/user-application/worker/trpc/routers/agent-keys.ts`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/trpc/routers/agent-keys.ts)

Mount file:
- [`apps/user-application/worker/trpc/router.ts`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/trpc/router.ts)

Purpose:
- The first-party app should call internal tRPC.
- Public REST remains the external product contract documented in `/docs`.

Recommended procedures:

#### `getSettings`
Returns:
- `canManage: boolean`
- `reason: string | null`
- `apiKeys: AgentApiKey[]`

Behavior:
- Call `checkUserAccess(ctx.userInfo.userId)`.
- If `hasAccess === false`, return:
  - `canManage: false`
  - `reason: 'Only the workspace owner can manage API keys.'`
  - `apiKeys: []`
- If `viaTeam === true`, return the same safe read model.
- Otherwise call:
  - `ctx.env.BACKEND_SERVICE.listAgentApiKeys(ctx.userInfo.userId)`

#### `create`
Input:
- `createAgentApiKeyInputSchema`

Behavior:
- Call `checkUserAccess(ctx.userInfo.userId)`.
- If `hasAccess === false` or `viaTeam === true`, throw:
  - `new TRPCError({ code: 'FORBIDDEN' })`
- Otherwise call:
  - `ctx.env.BACKEND_SERVICE.createAgentApiKey(ctx.userInfo.userId, input.label)`

#### `revoke`
Input:
- `{ apiKeyId: string }`

Behavior:
- Same owner-only guard as `create`
- Call:
  - `ctx.env.BACKEND_SERVICE.revokeAgentApiKey(ctx.userInfo.userId, input.apiKeyId)`

Implementation notes:
- No new session-only route wiring is needed. The Settings page already sits behind authenticated tRPC handling.
- `publicProcedure` in this codebase is just the base tRPC procedure, not public internet access by itself.

### 3.2 Enforce the same owner-only rule on REST session endpoints
File:
- [`apps/user-application/worker/hono/routes/agent-api.ts`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/hono/routes/agent-api.ts)

Apply an owner guard to:
- `POST /api/agent/v1/api-keys`
- `GET /api/agent/v1/api-keys`
- `DELETE /api/agent/v1/api-keys/:apiKeyId`

Guard rules:
- Call `checkUserAccess(c.get("userId"))`
- If `hasAccess === false`, return `403`
- If `viaTeam === true`, return `403`
- Error payload should clearly indicate:
  - `owner_access_required`

Keep unchanged:
- The bearer-authenticated run and browser-session endpoints

Why:
- Hiding UI is not enough. Team members must also be blocked from direct session-authenticated REST access.

### 3.3 Add the API tab to Settings
Files:
- [`apps/user-application/src/routes/app/_authed/settings.tsx`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/app/_authed/settings.tsx)
- [`apps/user-application/src/components/settings/index.ts`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/settings/index.ts)

Changes:
- Add tab id:
  - `api`
- Add a sidebar item:
  - title `API`
  - icon `KeyRound` or `Key`
- Query:
  - `trpc.agentKeys.getSettings`
- Show the `API` tab only when `canManage === true`
- If the active tab is `api` and `canManage` becomes false, reset to `profile`

Recommended note:
- A deep link to the API tab is optional. For this task, `/app/settings` is enough even if tab state remains local.

### 3.4 Create the API section component
New file:
- [`apps/user-application/src/components/settings/api-section.tsx`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/settings/api-section.tsx)

Responsibilities:
- Create API key with optional label
- Reveal plaintext key only immediately after creation
- List existing keys
- Revoke a key
- Link to `/docs`

Recommended UI blocks:
- Heading: `API`
- Helper copy: `Create and manage Stepps agent API keys for browser runs and integrations.`
- Create panel:
  - label input
  - `Create API key` button
- One-time secret panel:
  - plaintext key in an input or code block
  - copy button
  - warning: `Store this now. You will not be able to see it again.`
- Existing keys list:
  - `label`
  - `keyPrefix`
  - `keyLast4`
  - `createdAt`
  - `lastUsedAt`
  - `revokedAt`
  - revoke action
- Small docs block:
  - `Read the API reference`
  - link to `/docs`

Recommended client behavior:
- Query with `trpc.agentKeys.getSettings`
- Use local state for the just-created plaintext key
- Invalidate `trpc.agentKeys.getSettings` after create and revoke
- If `canManage` is false, do not render the section

## Workstream 4: Align docs with the real product flow

### 4.1 Update wording from "dashboard" to `Settings -> API`
Files:
- [`apps/user-application/src/lib/agent-api-docs.ts`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/lib/agent-api-docs.ts)
- [`apps/user-application/src/components/api-docs/api-docs-page.tsx`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/api-docs/api-docs-page.tsx)

Required copy changes:
- `Create a workspace-scoped agent API key from the logged-in Stepps dashboard.`
  - replace with:
  - `Create a workspace-scoped agent API key in Settings -> API in the logged-in Stepps app.`
- Starter flow step 1:
  - from `Create an agent API key from the Stepps dashboard`
  - to `Create an agent API key in Settings -> API`
- CTA:
  - from `Open dashboard`
  - to `Open settings`
- CTA target:
  - `/app/settings`

### 4.2 Fix auth-mode documentation for browser session endpoints
Source of truth:
- [`apps/user-application/worker/hono/routes/agent-api.ts`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/hono/routes/agent-api.ts)

Required corrections:
- `POST /api/agent/v1/browser-sessions/pairing-tokens` should be documented as bearer auth
- `GET /api/agent/v1/browser-sessions` should be documented as bearer auth

That means the docs auth summary should become:
- Website session:
  - API key management only
- Bearer token:
  - browser session setup
  - run orchestration

Also update the examples/quickstart copy to reflect the real sequence:
1. create API key in `Settings -> API`
2. use that API key to create pairing token
3. list browser sessions with bearer auth
4. create run
5. poll run
6. open returned shared guide URL

## Recommended implementation order

1. Patch `getAllPublishedGuides()` in [`packages/data-ops/src/queries/guides.ts`](/Users/wernerjohannesdieben/steppsai-total/packages/data-ops/src/queries/guides.ts)
2. Patch agent-run visibility behavior in [`apps/data-service/src/rpc-methods/agent-api.ts`](/Users/wernerjohannesdieben/steppsai-total/apps/data-service/src/rpc-methods/agent-api.ts)
3. Add [`apps/user-application/worker/trpc/routers/agent-keys.ts`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/trpc/routers/agent-keys.ts)
4. Mount the router in [`apps/user-application/worker/trpc/router.ts`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/trpc/router.ts)
5. Add owner-only guard to [`apps/user-application/worker/hono/routes/agent-api.ts`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/hono/routes/agent-api.ts)
6. Create [`apps/user-application/src/components/settings/api-section.tsx`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/settings/api-section.tsx)
7. Export it from [`apps/user-application/src/components/settings/index.ts`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/settings/index.ts)
8. Add the `API` tab in [`apps/user-application/src/routes/app/_authed/settings.tsx`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/app/_authed/settings.tsx)
9. Update [`apps/user-application/src/components/share-dialog.tsx`](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/share-dialog.tsx)
10. Pass `guideVisibility` through all `ShareDialog` call sites
11. Fix docs wording and auth descriptions in `/docs`

## Test checklist

### Public guides
- Create a guide with:
  - `status = 'published'`
  - `visibility = 'private'`
- Confirm:
  - it is reachable at `/shared/:guideId`
  - it does not appear on `/guides`
  - it does not appear in sitemap-backed public indexing paths

- Create a guide with:
  - `status = 'published'`
  - `visibility = 'public'`
- Confirm:
  - it is reachable at `/shared/:guideId`
  - it appears on `/guides`

### Agent-created guides
- Create an agent run with `output.shareGuide = true`
- Confirm:
  - resulting guide ends as `status = 'published'`
  - resulting guide stays `visibility = 'private'`
  - it is shareable by `/shared/:guideId`
  - it does not appear on `/guides` until visibility is explicitly changed

- Create an agent run with `output.shareGuide = false`
- Confirm:
  - resulting guide ends as `status = 'draft'`
  - resulting guide remains `visibility = 'private'`

### Share dialog
- Open Share on a draft guide
- Confirm:
  - no copyable link yet
  - copy explains publish is needed for share link
  - public listing is clearly separate

- Publish a guide from the Share dialog
- Confirm:
  - share link becomes available
  - guide remains unlisted while visibility is still private

- Turn on public listing
- Confirm:
  - guide becomes visible on `/guides`

### API key settings
- Log in as owner
- Open `Settings -> API`
- Confirm:
  - key list loads
  - create works
  - plaintext key is shown once
  - revoke works

- Log in as team member on a team-owned workspace
- Confirm:
  - no API tab is shown
  - direct calls to session REST key endpoints return `403`
  - direct tRPC create/revoke attempts fail with `FORBIDDEN`

### Docs
- Open `/docs`
- Confirm:
  - it says `Settings -> API`
  - browser-session endpoints are documented as bearer-authenticated
  - the quickstart ordering matches the real implementation

## Risks and gotchas
- The completion-path visibility overwrite is easy to miss. If not fixed, prompt-created guides will still leak publicly.
- `getAllPublishedGuides()` is used beyond the `/guides` page, so this change also affects sitemap output. That is desired.
- Some Share dialog call sites use custom local state shapes rather than the full `Guide` type. Those shapes must be extended to include `visibility`.
- UI hiding without backend enforcement is insufficient. Owner-only must be enforced in both tRPC and REST.
- Existing dashboard and folder screens already expose separate visibility controls. Leaving them unchanged is acceptable for this task, but the UX will not be perfectly uniform.

## Definition of done
This task is complete when all of the following are true:

- Public listing requires both `published` and `visibility = 'public'`
- Direct private shared links still work
- Agent-created guides no longer become public automatically
- Owners can manage API keys from `Settings -> API`
- Team members cannot manage API keys through either UI or session REST endpoints
- `/docs` accurately describes the real settings flow and auth model
