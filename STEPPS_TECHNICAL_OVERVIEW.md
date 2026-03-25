# Stepps Technical Overview

One end-to-end reference for how Stepps is structured across the monorepo, how recording actually works, where data lives, and where Cloudflare Browser Rendering fits.

This file is the best "single read" entry point.
For deeper detail, use it together with:

- [USER_APPLICATION_ARCHITECTURE.md](./USER_APPLICATION_ARCHITECTURE.md)
- [architecture.md](./architecture.md)
- [agents/discussion/recording_workflow.md](./agents/discussion/recording_workflow.md)
- [agents/desktop-capture-implementation.md](./agents/desktop-capture-implementation.md)
- [apps/data-service/R2-upload-overview.md](./apps/data-service/R2-upload-overview.md)

## The Shortest Correct Explanation

Stepps records workflows in the browser extension, not in Cloudflare Browser Rendering.

- The browser extension captures clicks, navigation, and screenshots while the user records.
- Assets are uploaded into the backend storage flow backed by R2.
- The `data-service` Worker handles storage, queues, workflows, exports, and backend-side processing.
- The `user-application` Worker is the app-facing BFF: it serves the React app, auth routes, and typed API routes.
- Cloudflare Browser Rendering is used server-side for rendering jobs like PDF export and WebP-to-PNG conversion, not for live workflow recording.

## Monorepo Shape

At a high level, the system is split into three runtime applications plus shared packages.

### `apps/user-application`

This is the public site and the logged-in web app.

It contains:

- the React frontend
- the Cloudflare Worker BFF
- auth routes
- tRPC routes for the app
- the boundary where frontend requests are authenticated and validated

Main stack:

- React
- TanStack Router
- TanStack Query
- tRPC
- Hono
- Better Auth
- Cloudflare Workers

Operationally, this app is the primary user-facing entry point.

### `apps/data-service`

This is the heavier backend Worker.

It contains:

- R2 upload and asset-serving logic
- queue producers and consumers
- async workflow triggers
- export generation
- image and document processing
- worker-to-worker RPC methods used by `user-application`

This Worker is where Stepps does storage and asynchronous backend work.

### `apps/browser-extension`

This is the runtime for live recording.

It contains:

- capture start/stop logic
- step capture logic
- screenshot collection
- sidepanel state
- local buffering during recording
- upload calls into the Stepps backend flow

This is the critical point: the extension is responsible for recording the workflow itself.

### `packages/*`

Shared code lives here, especially data contracts and schemas.

This typically includes:

- Zod schemas
- data access contracts
- shared types and query helpers
- auth-related shared logic

## Core System Boundary

The cleanest way to think about the architecture is this:

1. `browser-extension` captures user actions.
2. `user-application` is the authenticated app and BFF.
3. `data-service` owns storage, async processing, exports, and backend workflows.

In many paths, `user-application` does not call `data-service` over public HTTP. It calls it through a Cloudflare Worker binding such as `BACKEND_SERVICE`, which makes the backend boundary explicit but still keeps service-to-service calls inside Cloudflare's network.

## How Auth and App Requests Flow

The `user-application` Worker is the frontend-facing server layer.

It serves:

- the React SPA
- auth endpoints
- tRPC endpoints

Conceptually:

```text
Browser
  -> user-application Worker
     -> auth handler
     -> tRPC handler
     -> static app assets
     -> BACKEND_SERVICE binding to data-service when backend work is needed
```

That means:

- auth is app-facing, not extension-facing backend internals
- UI talks to typed app routes
- heavier asset/workflow/export logic is delegated to `data-service`

## How Recording Actually Works

Live recording is extension-native.

It does not depend on Cloudflare Browser Rendering.

### Runtime flow

1. The user starts recording in the extension.
2. The extension starts a recording session and stores session state locally.
3. On each captured action, the extension records metadata such as selector, URL, timestamps, and screenshot context.
4. Screenshots are uploaded quickly into the backend storage path backed by R2.
5. Step metadata is buffered locally in Chrome storage during the active session.
6. When the user stops recording, the extension submits the batch for ingest.
7. The backend validates and persists the guide and steps through queue and database processing.

This strategy is important because it separates:

- immediate capture UX
- durable asset storage
- final database commit

### Why the extension buffers locally

The local storage buffer exists so recording does not depend on a database write for every click.

That gives you:

- better UX during capture
- resilience during transient connectivity issues
- a cleaner batch ingest model

The recording session is therefore not a stream of database mutations. It is a buffered capture session plus durable asset upload.

## Desktop and Screen Capture

The extension's capture implementation uses browser capture primitives, not Cloudflare rendering.

The important capture-side change was moving from tab-only capture to `getDisplayMedia()` via an offscreen document, so Stepps can record:

- browser tabs
- full windows
- full screens
- native desktop apps, depending on what the user selects

That means the extension can capture workflows that span beyond the browser.

Conceptually:

```text
User starts recording
  -> extension opens capture flow
  -> Chrome capture picker appears
  -> user chooses screen/window/tab
  -> extension captures frames and interaction metadata
  -> backend receives uploaded assets and final ingest payload
```

## R2 Upload Model

R2 sits behind the backend flow, not as a direct primary application database.

The upload path usually looks like this:

1. frontend or extension prepares a key and file payload
2. request goes through app-facing API or service boundary
3. `data-service` receives the upload request
4. `data-service` writes bytes into the bound R2 bucket
5. keys are later transformed into public asset URLs when needed

This applies to:

- recording screenshots
- avatars
- brand assets
- export artifacts
- imported or generated images

The most important operational point is that `data-service` is the system that actually owns the R2 write path.

## What `data-service` Owns

`data-service` is the backend execution engine around the app.

It is responsible for:

- upload handling
- asset reads and deletes
- queue submission and queue consumption
- workflow execution
- export generation
- image conversion
- document artifact creation
- backend-side RPC entry points

If `user-application` is the app-facing BFF, `data-service` is the backend workhorse.

## Queue and Async Processing Model

Stepps intentionally pushes heavier work into async processing.

Typical flow:

1. user action or extension action triggers a backend request
2. backend validates the input
3. a queue message or workflow is created
4. a consumer or workflow continues processing
5. DB state and artifact state are updated as processing completes

This keeps interactive requests lightweight and shifts heavier operations into background execution.

This matters especially for:

- recording ingest
- export generation
- image processing
- artifact preparation

## Where Cloudflare Browser Rendering Fits

Cloudflare Browser Rendering is not the live capture engine.

In this codebase it is a server-side rendering utility used by `data-service`.

Its job is closer to:

- "render this HTML into a PDF"
- "render this image-containing HTML into a PNG"

not:

- "capture what the user is doing live"

### Current browser-render usage

The relevant helper is:

- `apps/data-service/src/helpers/browser-render.ts`

It is used for:

- `renderGuideToPdf(...)`
  - sends HTML to Cloudflare's browser-rendering PDF API
  - receives a PDF back
- `convertWebpToPng(...)`
  - sends minimal HTML to Cloudflare's screenshot API
  - receives PNG output back

This is export/render infrastructure, not recording infrastructure.

## Export Flow

When Stepps exports a guide, the backend path is roughly:

1. export is triggered
2. backend workflow gathers guide data
3. backend resolves image/assets
4. HTML is generated server-side
5. if PDF is needed, `data-service` calls Cloudflare Browser Rendering
6. generated artifact is stored
7. export status is updated
8. the app can poll or read the final artifact state

So the export system is "backend render pipeline + artifact storage", not a frontend browser feature.

## Environment and Service Bindings

There are two important kinds of infrastructure configuration here.

### 1. Worker-to-worker service bindings

These allow `user-application` to call `data-service` internally.

This is how app-facing routes delegate backend operations without exposing every internal flow as public HTTP.

### 2. Cloudflare credentials for Browser Rendering

Browser Rendering is enabled through environment variables in `data-service`, typically:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN_BROWSER`

Those credentials are used to call Cloudflare's browser-rendering REST endpoints for PDF and screenshot rendering.

## How to Think About the Architecture

The cleanest mental model is:

- `browser-extension` is the capture runtime
- `user-application` is the user-facing app and BFF
- `data-service` is the backend execution and storage layer
- R2 is the durable asset store
- queues and workflows handle async processing
- Cloudflare Browser Rendering is a rendering utility for exports, not a recorder

## Common Misunderstanding to Avoid

The phrase "browser rendering" sounds like it might be responsible for recording browser actions.

That is not true in Stepps.

Recording is done by the extension inside the user's browser environment.
Cloudflare Browser Rendering is only used later, on the backend, when Stepps needs to render output artifacts such as PDFs or convert image formats.

## Recommended Reading Order

If someone is new to the codebase, this is the fastest path:

1. [architecture.md](./architecture.md)
2. [USER_APPLICATION_ARCHITECTURE.md](./USER_APPLICATION_ARCHITECTURE.md)
3. [agents/discussion/recording_workflow.md](./agents/discussion/recording_workflow.md)
4. [agents/desktop-capture-implementation.md](./agents/desktop-capture-implementation.md)
5. [apps/data-service/R2-upload-overview.md](./apps/data-service/R2-upload-overview.md)

After that, jump into implementation files:

- `apps/data-service/src/helpers/browser-render.ts`
- `apps/data-service/src/hono/routes/exports.ts`
- the `user-application` Worker tRPC router
- the extension recording and background handlers

## One-Sentence Version

Stepps records workflows in the browser extension, routes app and auth traffic through the `user-application` Worker, pushes storage and async backend work into `data-service`, stores assets in R2, and uses Cloudflare Browser Rendering only for backend export/render jobs like PDF generation and image conversion.
