# Stepps source of truth: API keys, guide visibility, and agent sharing

Last verified against the codebase on 2026-03-30.

## Purpose
This document is the single reference for how Stepps currently handles:
- guide sharing vs public listing
- agent-created guide visibility
- API key management
- auth model for the public Agent API
- internal app ownership rules

Use this as the reference document for another project.

## 1. Guide visibility model

### Canonical product behavior
Stepps uses two separate concepts:

- `status`
  - controls whether a guide is shareable by direct link
- `visibility`
  - controls whether a guide is listed on the public Stepps website

### Canonical states
- `draft`
  - not shareable
  - not publicly listed
- `published + private`
  - shareable by `/shared/:guideId`
  - not listed on `/guides`
- `published + public`
  - shareable by `/shared/:guideId`
  - listed on `/guides`

### Public listing rule
A guide appears on the public Stepps guides page only when both are true:
- `status = 'published'`
- `visibility = 'public'`

### Direct shared-link rule
A guide is accessible through `/shared/:guideId` when:
- `status = 'published'`

`visibility = 'public'` is not required for direct sharing.

## 2. Current implemented guide behavior

### Public guides query
Implemented in:
- `/Users/wernerjohannesdieben/steppsai-total/packages/data-ops/src/queries/guides.ts`

Current behavior:
- `getAllPublishedGuides()` filters on:
  - `status = 'published'`
  - `visibility = 'public'`
- `getPublishedGuide(guideId)` filters only on:
  - `status = 'published'`

This is correct.

### Share dialog
Implemented in:
- `/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/share-dialog.tsx`

Current behavior:
- publishing enables the share link
- public listing is a separate toggle
- the dialog accepts:
  - `guideStatus`
  - `guideVisibility`
- the dialog uses `trpc.guides.publish` for publish
- the dialog uses `trpc.guides.update` to toggle `visibility`

Current copy is aligned with the intended model:
- published = shareable by link
- public listing is separate

### Share dialog call sites
Current call sites already pass visibility:
- `/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/app/_authed/editor/$guideId.tsx`
- `/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/app/_authed/stepps/$guideId.tsx`
- `/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/app/_authed/stepps/index.tsx`
- `/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/app/_authed/folder/$folderId.tsx`
- `/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/dashboard/recent-stepps.tsx`

## 3. Agent-created guide behavior

Implemented in:
- `/Users/wernerjohannesdieben/steppsai-total/apps/data-service/src/rpc-methods/agent-api.ts`

### Run creation
When an agent run creates a guide shell:
- `status = 'recording'`
- `visibility = 'private'`

### Run completion
When an agent run completes:
- if `output.shareGuide = true`
  - final guide status becomes `published`
- if `output.shareGuide = false`
  - final guide status becomes `draft`
- completion does **not** force `visibility = 'public'`

### Meaning
Agent-generated guides are currently:
- private by default
- shareable by link only when `shareGuide = true`
- not publicly listed unless someone explicitly changes `visibility` to `public`

This is correct.

## 4. API key product model

### What API keys are for
Stepps agent API keys are used for the public Agent API:
- browser session pairing
- listing paired browser sessions
- creating runs
- polling runs
- reading run artifacts

### Public external API shape
Public API routes live in:
- `/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/hono/routes/agent-api.ts`

### Public REST auth model
There are two auth modes:

#### A. Website session auth
Used only for API key management:
- `POST /api/agent/v1/api-keys`
- `GET /api/agent/v1/api-keys`
- `DELETE /api/agent/v1/api-keys/:apiKeyId`

#### B. Bearer API key auth
Used for agent runtime/orchestration:
- `POST /api/agent/v1/browser-sessions/pairing-tokens`
- `GET /api/agent/v1/browser-sessions`
- `POST /api/agent/v1/runs`
- `GET /api/agent/v1/runs/:runId`
- `POST /api/agent/v1/runs/:runId/resume`
- `POST /api/agent/v1/runs/:runId/cancel`
- `GET /api/agent/v1/runs/:runId/artifacts`

### API key storage model
API keys are:
- owner-scoped
- hashed at rest
- only shown in plaintext once at creation time
- revocable
- auditable through prefix / last4 / timestamps

Underlying persistence exists in:
- `/Users/wernerjohannesdieben/steppsai-total/packages/data-ops/src/queries/agent-api.ts`

## 5. Internal app implementation for API keys

### Settings UI
Implemented in:
- `/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/app/_authed/settings.tsx`
- `/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/settings/api-section.tsx`
- `/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/settings/index.ts`

Current UI:
- `Settings -> API` exists
- users can:
  - list keys
  - create key with optional label
  - see plaintext key once
  - revoke key
  - jump to `/docs`

### Internal app transport
The first-party app uses internal `tRPC`, not REST, for the Settings page.

Implemented in:
- `/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/trpc/routers/agent-keys.ts`
- `/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/trpc/router.ts`

Current tRPC procedures:
- `agentKeys.getSettings`
- `agentKeys.create`
- `agentKeys.revoke`

## 6. Ownership rules

### Intended product rule
API keys are workspace-owner credentials.
Team members must not manage them.

### Current implemented owner rule
#### tRPC settings flow
In:
- `/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/trpc/routers/agent-keys.ts`

Current behavior:
- team members are blocked
- direct owners are allowed
- the implementation checks `viaTeam === true`

#### REST session API-key flow
In:
- `/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/hono/routes/agent-api.ts`

Current behavior:
- routes use:
  - `authMiddleware`
  - `accessMiddleware`
  - `requireOwnerAccess(...)`
- team members get:
  - `403 owner_access_required`

## 7. One important current inconsistency
This is the main thing that is still not fully unified.

### Current mismatch
`tRPC` and `REST` do not enforce exactly the same preconditions.

#### tRPC Settings behavior
`agentKeysRouter` currently allows direct owners even if they do not have active paid access, because it only blocks team membership.

#### REST session route behavior
The REST API-key routes still go through `accessMiddleware`, which means active access is still required before owner management routes are reachable.

### Meaning
Current repo behavior is:
- team members cannot manage keys
- direct owners can manage keys through the Settings tRPC flow
- but the session REST key endpoints are stricter because they still depend on access middleware

### Recommendation for any new project
Pick one rule and apply it consistently everywhere:

#### Option A: owner-only, regardless of active subscription
- simplest credential ownership model
- matches current `tRPC` behavior more closely

#### Option B: owner-only, and active access required
- stricter SaaS entitlement model
- matches current session REST middleware chain more closely

Do not leave this split unresolved in a fresh implementation.

## 8. Public docs model

### Public API docs
Implemented in:
- `/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/lib/agent-api-docs.ts`
- `/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/api-docs/api-docs-page.tsx`

Current docs behavior:
- docs point users to `Settings -> API`
- browser-session endpoints are documented as bearer-authenticated
- run endpoints are documented as bearer-authenticated
- API key management is documented as website-session authenticated

This is aligned with the current public REST contract.

## 9. What another project should copy
If you want to replicate this cleanly in another project, copy these rules exactly:

### Guide-sharing rules
- `status` controls shareability
- `visibility` controls public listing
- public listing requires both `published` and `public`
- direct shared links require only `published`

### Agent-run rules
- agent-generated guides start private
- completing a run may publish the guide
- completing a run must not auto-list it publicly

### API-key rules
- API keys are owner credentials
- first-party app uses internal app RPC for settings management
- public/external integrations use REST + bearer token
- plaintext key is revealed once only
- keys are revocable and listed by prefix/last4

### Docs rules
- docs must point to the real UI path where keys are created
- docs must distinguish website-session endpoints from bearer-authenticated endpoints

## 10. Definition of a clean implementation
A clean implementation is one where all of the following are true:
- public listing requires `published + public`
- shared links work for `published + private`
- agent-created guides stay private unless explicitly listed
- Settings has a real API-key management surface
- team members cannot manage owner API keys
- public docs reflect the actual auth model and UI flow
- internal RPC rules and session REST rules use the same ownership/access policy

## 11. Recommended next cleanup in this repo
If this repo itself is being cleaned further, the next thing to resolve is only this:
- unify the owner/access rule between:
  - `agentKeysRouter` tRPC
  - session REST API-key routes

Everything else in this document is already implemented and aligned.
