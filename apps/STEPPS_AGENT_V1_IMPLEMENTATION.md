# Stepps Agent API v1 implementation

## What is implemented

### Public external API
- `REST v1` remains the public contract for external callers.
- Implemented routes live in [agent-api.ts](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/hono/routes/agent-api.ts).
- Current public endpoints:
  - `POST /api/agent/v1/api-keys`
  - `GET /api/agent/v1/api-keys`
  - `DELETE /api/agent/v1/api-keys/:apiKeyId`
  - `POST /api/agent/v1/browser-sessions/pairing-tokens`
  - `GET /api/agent/v1/browser-sessions`
  - `POST /api/agent/v1/runs`
  - `GET /api/agent/v1/runs/:runId`
  - `POST /api/agent/v1/runs/:runId/resume`
  - `POST /api/agent/v1/runs/:runId/cancel`
  - `GET /api/agent/v1/runs/:runId/artifacts`

### Internal first-party runtime path
- Internal browser runtime now follows the existing Stepps pattern:
  - extension -> `tRPC`
  - `user-application` -> `BACKEND_SERVICE` Worker RPC
  - `data-service` -> data-ops / workflows / R2 helpers
- New internal tRPC router lives in [agent-runtime.ts](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/trpc/routers/agent-runtime.ts).
- It is mounted from [router.ts](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/trpc/router.ts).

### Data model and backend orchestration
- Added agent persistence in:
  - [schema.ts](/Users/wernerjohannesdieben/steppsai-total/packages/data-ops/src/drizzle-out/schema.ts)
  - [agent-api.ts](/Users/wernerjohannesdieben/steppsai-total/packages/data-ops/src/queries/agent-api.ts)
  - [agent-api.ts](/Users/wernerjohannesdieben/steppsai-total/packages/data-ops/src/zod/agent-api.ts)
  - [0002_agent_api.sql](/Users/wernerjohannesdieben/steppsai-total/packages/data-ops/src/drizzle-out/0002_agent_api.sql)
- Added backend RPC methods in:
  - [agent-api.ts](/Users/wernerjohannesdieben/steppsai-total/apps/data-service/src/rpc-methods/agent-api.ts)
  - [index.ts](/Users/wernerjohannesdieben/steppsai-total/apps/data-service/src/index.ts)
- Added planner in:
  - [generateAgentRunPlan.ts](/Users/wernerjohannesdieben/steppsai-total/apps/data-service/src/helpers/generateAgentRunPlan.ts)

### Browser extension runtime
- Extension runtime now pairs and executes through internal tRPC instead of internal REST.
- Relevant files:
  - [agent-runtime.ts](/Users/wernerjohannesdieben/steppsai-total/apps/browser-extension/src/background/agent-runtime.ts)
  - [agent-api.ts](/Users/wernerjohannesdieben/steppsai-total/apps/browser-extension/src/lib/agent-api.ts)
  - [index.ts](/Users/wernerjohannesdieben/steppsai-total/apps/browser-extension/src/background/index.ts)
  - [manifest.json](/Users/wernerjohannesdieben/steppsai-total/apps/browser-extension/public/manifest.json)

## What the runtime does now

1. Pair extension browser session with a pairing token.
2. Heartbeat over internal tRPC.
3. Pick up a `waiting_for_browser` run from the paired session.
4. Execute bounded browser actions:
   - `open_tab`
   - `focus_tab`
   - `navigate`
   - `click`
   - `type`
   - `press`
   - `wait_for`
   - `scroll`
   - `capture`
   - `extract_text`
5. Capture screenshots with `chrome.tabs.captureVisibleTab`.
6. Upload screenshots through the existing image upload path.
7. Complete the guide through the existing guide storage and publishing flow.
8. Optionally trigger docs generation if the run requests it.

## Important architecture decision

- Public external API: `REST v1`
- Internal first-party runtime: `tRPC`

This matches the existing app structure better than keeping a second internal REST runtime protocol.

## What still needs manual verification

- DB migration needs to be applied from [0002_agent_api.sql](/Users/wernerjohannesdieben/steppsai-total/packages/data-ops/src/drizzle-out/0002_agent_api.sql).
- `data-service` and `user-application` need to be deployed.
- Extension needs to be rebuilt and reloaded.
- End-to-end run behavior still needs stage testing:
  - pair browser session
  - create run
  - confirm extension picks it up
  - confirm screenshots upload
  - confirm shared guide URL resolves

## Current intended v1 flow

Prompt:

```text
Record me how to integrate Claude + Shopify using the Stepps skill
```

System flow:

1. caller creates a run through `REST v1`
2. data-service plans bounded browser actions
3. paired Stepps extension receives the run through heartbeat
4. extension executes steps in browser
5. screenshots upload to R2 through existing image path
6. guide is finalized and published
7. caller reads back the run and gets the shared guide URL
