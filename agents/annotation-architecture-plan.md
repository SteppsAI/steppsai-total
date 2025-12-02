# Technical Design: Robust Annotation System with Cloudflare Durable Objects

## 1. Objective
Implement a robust, scalable system for managing guide annotations that:
1.  **Reduces Database Load:** Avoids writing to the primary Postgres database for every minor annotation change.
2.  **Ensures Persistence:** reliably saves work-in-progress (draft) annotations.
3.  **Enables Real-Time:** Paves the way for future real-time collaboration (multi-user editing) using WebSockets.

## 2. Why Durable Objects over KV?

### The Problem with KV (Cloudflare Key-Value Store)
- **Eventually Consistent:** KV is optimized for reads and uses global replication. This means writes can take time to propagate, leading to potential race conditions.
- **No Write Ordering Guarantees:** If a user rapidly updates annotations (e.g., dragging an element), writes may arrive out of order across replicas.
- **Manual Conflict Resolution:** You would need to implement your own timestamp-based conflict resolution or versioning system.
- **No Native WebSocket Support:** KV is purely a storage layer; adding real-time features would require additional infrastructure.

### Why Durable Objects are Superior for This Use Case

#### 1. **Strong Consistency**
- A Durable Object instance is **single-threaded** and runs on a single Edge location.
- All writes to the same DO instance are **serialized** automatically—no race conditions.
- When a user edits annotations, every update is guaranteed to be processed in order.

#### 2. **In-Memory State with Durable Persistence**
- The DO keeps the active session state in RAM for ultra-fast reads/writes (<10ms).
- The `ctx.storage` API provides durable persistence to disk, ensuring data survives restarts.
- This hybrid approach combines performance with reliability.

#### 3. **Built-in Business Logic**
- You can add validation, transformations, and constraints directly in the DO (e.g., "max 50 annotations per step").
- Encapsulates all session logic in one place, rather than scattering it across API endpoints.

#### 4. **WebSocket-Ready Architecture**
- Durable Objects natively support WebSocket connections.
- When you're ready to add real-time collaboration (Phase 2), you won't need to refactor—just upgrade the DO to handle WebSocket messages.

### Practical Example: Race Condition Scenario

**With KV:**
```typescript
// User drags annotation quickly, triggering 3 rapid updates
await env.CACHE.put('draft:guide-123', JSON.stringify(state1)); // Write 1
await env.CACHE.put('draft:guide-123', JSON.stringify(state2)); // Write 2
await env.CACHE.put('draft:guide-123', JSON.stringify(state3)); // Write 3

// Problem: Due to replication lag, Write 3 might arrive before Write 2
// Result: Outdated state is stored, user loses changes
```

**With Durable Object:**
```typescript
const doId = env.GUIDE_SESSION.idFromName('guide-123');
const stub = env.GUIDE_SESSION.get(doId);

await stub.update(state1); // Guaranteed order: 1 → 2 → 3
await stub.update(state2);
await stub.update(state3);

// Result: All updates are processed in sequence. No data loss.
```

### Decision: Use Durable Objects
For active editing sessions where **consistency**, **performance**, and **future real-time capabilities** are critical, **Durable Objects** are the clear choice. KV remains useful for **read-heavy, eventually-consistent data** like published guides or global configuration.

---

## 3. Architecture Overview

### Current State
- **Frontend:** Editor directly updates state.
- **Persistence:** "Save" triggers a direct write to Postgres.
- **Problem:** Risk of data loss if not saved frequently; performance hit if saved too frequently.

### Target Architecture (Option B + Real-Time Ready)
We will introduce a **Cloudflare Durable Object (DO)** acting as the "Source of Truth" for the active editing session of a guide.

1.  **Client (Editor):** Connects to the Durable Object (initially via HTTP, later via WebSocket).
2.  **Durable Object (`GuideSessionDO`):**
    -   Holds the current `steps` and `annotations` in memory/storage.
    -   Handles fast reads/writes.
    -   Debounces writes to the durable storage.
3.  **KV Store (Optional):** Can be used as a read-through cache for public views if DO is overkill for read-only, but DO `storage` is often sufficient and simpler for consistency.
4.  **Postgres DB:** The long-term storage. Updated only when the user explicitly clicks "Save" or "Publish".

## 3. Implementation Plan

### Phase 1: The Durable Object Foundation (Drafts & Persistence)
*Goal: Move draft state management to the Edge.*

#### A. Backend Changes (`apps/data-service`)

1.  **Create `GuideSession` Durable Object:**
    -   **Location:** `apps/data-service/src/durable-objects/GuideSession.ts`
    -   **State:** Stores the full JSON of `steps` (including overlays).
    -   **Methods:**
        -   `fetch(request)`: Handles HTTP requests for `GET /state` and `POST /update`.
        -   `updateState(newState)`: Updates local storage.
        -   `saveToDb()`: Triggers the sync to Postgres (calls existing logic).

2.  **API Endpoints (Hono in `apps/data-service`):**
    -   `GET /api/editor/:guideId/session`: Proxies to the DO to get current draft state.
    -   `POST /api/editor/:guideId/update`: Proxies to the DO to update state (debounced from frontend).
    -   `POST /api/editor/:guideId/save`: Tells DO to persist current state to Postgres.

3.  **Configuration:**
    -   Update `wrangler.jsonc` to define the `GuideSession` Durable Object binding.
    -   Add migration for the DO class.

#### B. Frontend Changes (`apps/user-application`)

1.  **Editor Initialization:**
    -   On load, fetch guide data.
    -   *Check:* Is there an active session in the DO?
        -   **Yes:** Load from DO (it has the latest unsaved changes).
        -   **No:** Load from DB and initialize the DO.

2.  **Auto-Saving (Drafts):**
    -   As user edits annotations, send `PUT` requests to the DO (e.g., every 500ms or on blur).
    -   *UX:* Show "Saved to draft" indicator.

3.  **Explicit Save:**
    -   "Save" button calls the `save` endpoint, which triggers the DO -> DB sync.

### Phase 2: Real-Time & WebSockets (Future)
*Goal: Enable "Google Docs" style collaboration.*

1.  **Upgrade DO to WebSocket Server:**
    -   Implement `webSocketMessage` handler in `GuideSession`.
    -   Manage connected clients list.
2.  **Frontend WebSocket Connection:**
    -   Replace HTTP polling/updates with a persistent WebSocket connection.
    -   Listen for `UPDATE` messages to update the canvas in real-time.

## 4. Code Structure Example

### `apps/data-service/src/durable-objects/GuideSession.ts`

```typescript
import { DurableObject } from "cloudflare:workers";

export class GuideSession extends DurableObject<Env> {
    state: any = null;

    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
        // Load state from storage on initialization
        ctx.blockConcurrencyWhile(async () => {
            this.state = await ctx.storage.get("guide_state");
        });
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        
        // Phase 1: HTTP API
        if (url.pathname.endsWith("/get")) {
            return new Response(JSON.stringify(this.state || {}), { 
                headers: { "Content-Type": "application/json" } 
            });
        }
        
        if (url.pathname.endsWith("/update") && request.method === "POST") {
            const data = await request.json();
            this.state = data;
            // Persist to DO storage (fast)
            await this.ctx.storage.put("guide_state", this.state);
            return new Response("Updated", { status: 200 });
        }

        // Phase 2: WebSocket Upgrade
        if (request.headers.get("Upgrade") === "websocket") {
             const pair = new WebSocketPair();
             this.handleSession(pair[1]);
             return new Response(null, { status: 101, webSocket: pair[0] });
        }

        return new Response("Not found", { status: 404 });
    }
    
    // ... WebSocket logic (broadcastMsg, etc.)
}
```

## 5. Next Steps
1.  **Approve this plan.**
2.  **Setup:** Configure `wrangler.jsonc` for the new Durable Object.
3.  **Implement:** Create the `GuideSession` class in `apps/data-service`.
4.  **Integrate:** Connect Hono router to the DO.
