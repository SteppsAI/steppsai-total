# Implementation Plan: Durable Object Editor Sessions

## Overview
Integrate a Durable Object (`GuideSession`) to manage editor state between the frontend and database, enabling persistent drafts without constant DB writes.

## Smart Sync Strategy (Local-First)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Local React State                                                          │
│  (immediate UI updates)                                                     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       │ After 3 seconds of inactivity
                                       │ OR on tab switch / page leave
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Durable Object Storage                                                     │
│  (draft persistence - survives refresh)                                     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       │ On explicit "Save" click
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PostgreSQL Database                                                        │
│  (permanent storage)                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Principle**: NOT every edit hits DO. We batch locally, sync to DO only on:
- 3 seconds of inactivity (user stopped typing/drawing)
- User switches tab or navigates away
- User explicitly saves (which also writes to DB)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Editor ($guideId.tsx)                            │   │
│  │  - Local React state for immediate UI updates                       │   │
│  │  - Debounced sync to Durable Object (every 500ms)                   │   │
│  │  - "Save" button triggers DO → DB sync                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   │ HTTP (Phase 1) / WebSocket (Phase 2)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE EDGE                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              GuideSession Durable Object                            │   │
│  │  - One instance per guideId                                         │   │
│  │  - In-memory state + ctx.storage for durability                     │   │
│  │  - Endpoints: GET /state, POST /update, POST /save                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│                                   │ On explicit "Save"                      │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              Postgres Database (via data-ops)                       │   │
│  │  - guides.steps JSONB (includes overlays/annotations)               │   │
│  │  - guides.title, status, etc.                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Session Lifecycle

1. **Editor Opens** (`$guideId.tsx` mounts):
   - Call `GET /api/editor/:guideId/session`
   - DO checks if it has stored state:
     - **Has draft**: Return DO state (user's unsaved work)
     - **No draft**: Fetch from DB, store in DO, return to client

2. **User Edits** (annotations, step captions, reorder):
   - Update local React state immediately (instant UI)
   - Debounce (500ms) → `POST /api/editor/:guideId/update` → DO stores in `ctx.storage`
   - Show "Draft saved" indicator

3. **User Clicks "Save"**:
   - Call `POST /api/editor/:guideId/save`
   - DO writes current state to Postgres
   - Clear DO draft (optional, or keep for recovery)
   - Show "Saved" indicator

4. **User Closes Without Saving**:
   - Draft remains in DO storage
   - Next time they open, they see their draft

5. **Discard Draft** (optional UX):
   - Call `POST /api/editor/:guideId/discard`
   - DO clears its storage, reloads from DB

---

## Implementation Steps

### Phase 1: Backend (data-service)

#### Step 1.1: Create GuideSession Durable Object
**File**: `apps/data-service/src/durable-objects/GuideSession.ts`

```typescript
import { DurableObject } from "cloudflare:workers";
import { updateGuide } from "@repo/data-ops/queries";
import { initDatabase } from "@repo/data-ops/database";

interface GuideState {
  title: string;
  steps: any[]; // Step[] with overlays
  lastModified: number;
}

export class GuideSession extends DurableObject<Env> {
  state: GuideState | null = null;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // Load persisted state on initialization
    ctx.blockConcurrencyWhile(async () => {
      this.state = await ctx.storage.get<GuideState>("guide_state") || null;
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // GET /state - Return current state (from DO or DB)
    if (path === "/state" && request.method === "GET") {
      return this.handleGetState(url);
    }

    // POST /update - Update draft state
    if (path === "/update" && request.method === "POST") {
      return this.handleUpdate(request);
    }

    // POST /save - Persist to database
    if (path === "/save" && request.method === "POST") {
      return this.handleSave(url);
    }

    // POST /discard - Clear draft, reload from DB
    if (path === "/discard" && request.method === "POST") {
      return this.handleDiscard();
    }

    return new Response("Not found", { status: 404 });
  }

  private async handleGetState(url: URL): Promise<Response> {
    // If we have a draft, return it
    if (this.state) {
      return Response.json({ 
        source: "draft", 
        data: this.state 
      });
    }

    // No draft - caller should fetch from DB and initialize
    return Response.json({ 
      source: "none", 
      data: null 
    });
  }

  private async handleUpdate(request: Request): Promise<Response> {
    try {
      const data = await request.json() as GuideState;
      
      this.state = {
        ...data,
        lastModified: Date.now(),
      };
      
      // Persist to DO storage (survives restarts)
      await this.ctx.storage.put("guide_state", this.state);
      
      return Response.json({ success: true, lastModified: this.state.lastModified });
    } catch (error) {
      return Response.json({ error: "Failed to update" }, { status: 500 });
    }
  }

  private async handleSave(url: URL): Promise<Response> {
    if (!this.state) {
      return Response.json({ error: "No draft to save" }, { status: 400 });
    }

    try {
      const guideId = url.searchParams.get("guideId");
      if (!guideId) {
        return Response.json({ error: "Missing guideId" }, { status: 400 });
      }

      // Initialize database connection
      initDatabase(this.env.DATABASE_URL);

      // Write to Postgres
      await updateGuide(guideId, {
        title: this.state.title,
        steps: this.state.steps,
      });

      // Optionally clear draft after save (or keep for recovery)
      // await this.ctx.storage.delete("guide_state");
      // this.state = null;

      return Response.json({ success: true, savedAt: Date.now() });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      return Response.json({ error: msg }, { status: 500 });
    }
  }

  private async handleDiscard(): Promise<Response> {
    await this.ctx.storage.delete("guide_state");
    this.state = null;
    return Response.json({ success: true });
  }
}
```

#### Step 1.2: Update wrangler.jsonc
Add the Durable Object binding:

```jsonc
{
  "durable_objects": {
    "bindings": [
      {
        "name": "GUIDE_SESSION",
        "class_name": "GuideSession"
      }
    ]
  },
  "migrations": [
    {
      "tag": "v1",
      "new_classes": ["GuideSession"]
    }
  ]
}
```

#### Step 1.3: Export from index.ts
```typescript
export { GuideSession } from './durable-objects/GuideSession';
```

#### Step 1.4: Create Hono Routes
**File**: `apps/data-service/src/hono/routes/editor.ts`

```typescript
import { Hono } from 'hono';

export const editorRouter = new Hono<{ Bindings: Env }>();

// Proxy all requests to the GuideSession DO
editorRouter.all('/:guideId/*', async (c) => {
  const guideId = c.req.param('guideId');
  
  // Get or create DO instance for this guide
  const doId = c.env.GUIDE_SESSION.idFromName(guideId);
  const stub = c.env.GUIDE_SESSION.get(doId);
  
  // Forward the request to the DO
  const url = new URL(c.req.url);
  const doPath = url.pathname.replace(`/api/editor/${guideId}`, '');
  url.pathname = doPath || '/state';
  url.searchParams.set('guideId', guideId);
  
  return stub.fetch(new Request(url.toString(), {
    method: c.req.method,
    headers: c.req.raw.headers,
    body: c.req.method !== 'GET' ? c.req.raw.body : undefined,
  }));
});
```

#### Step 1.5: Register Route in App
```typescript
import { editorRouter } from './routes/editor';
// ...
app.route('/api/editor', editorRouter);
```

---

### Phase 2: Frontend (user-application)

#### Step 2.1: Create Editor Session Hook
**File**: `apps/user-application/src/hooks/use-editor-session.ts`

```typescript
import { useCallback, useEffect, useRef, useState } from 'react';
import { Step, Guide } from '@/types/db';
import { debounce } from '@/lib/utils';

interface EditorSession {
  guide: Guide | null;
  isLoading: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
  updateState: (updates: Partial<{ title: string; steps: Step[] }>) => void;
  save: () => Promise<void>;
  discard: () => Promise<void>;
}

const DATA_SERVICE_URL = import.meta.env.VITE_DATA_SERVICE_URL;

export function useEditorSession(guideId: string, initialGuide: Guide): EditorSession {
  const [guide, setGuide] = useState<Guide | null>(initialGuide);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Debounced sync to DO
  const syncToDO = useRef(
    debounce(async (state: { title: string; steps: Step[] }) => {
      await fetch(`${DATA_SERVICE_URL}/api/editor/${guideId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
    }, 500)
  ).current;

  // Initialize session
  useEffect(() => {
    async function initSession() {
      setIsLoading(true);
      try {
        const res = await fetch(`${DATA_SERVICE_URL}/api/editor/${guideId}/state`);
        const { source, data } = await res.json();

        if (source === 'draft' && data) {
          // Use draft from DO
          setGuide({ ...initialGuide, ...data });
          setIsDirty(true);
        } else {
          // No draft, initialize DO with DB data
          setGuide(initialGuide);
          await fetch(`${DATA_SERVICE_URL}/api/editor/${guideId}/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: initialGuide.title,
              steps: initialGuide.steps,
            }),
          });
        }
      } catch (error) {
        console.error('Failed to init session:', error);
        setGuide(initialGuide);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, [guideId]);

  const updateState = useCallback((updates: Partial<{ title: string; steps: Step[] }>) => {
    setGuide(prev => {
      if (!prev) return prev;
      const newGuide = { ...prev, ...updates };
      
      // Sync to DO (debounced)
      syncToDO({ title: newGuide.title || '', steps: newGuide.steps || [] });
      setIsDirty(true);
      
      return newGuide;
    });
  }, [syncToDO]);

  const save = useCallback(async () => {
    const res = await fetch(`${DATA_SERVICE_URL}/api/editor/${guideId}/save`, {
      method: 'POST',
    });
    
    if (res.ok) {
      setIsDirty(false);
      setLastSaved(new Date());
    } else {
      throw new Error('Failed to save');
    }
  }, [guideId]);

  const discard = useCallback(async () => {
    await fetch(`${DATA_SERVICE_URL}/api/editor/${guideId}/discard`, {
      method: 'POST',
    });
    setGuide(initialGuide);
    setIsDirty(false);
  }, [guideId, initialGuide]);

  return { guide, isLoading, isDirty, lastSaved, updateState, save, discard };
}
```

#### Step 2.2: Update $guideId.tsx
Replace local state management with the session hook.

Key changes:
1. Use `useEditorSession` instead of `useState` for guide
2. Add "Save" button that calls `session.save()`
3. Show dirty indicator ("Unsaved changes")
4. Remove disabled mutation comments

---

### Phase 3: Type Definitions

#### Step 3.1: Update worker-configuration.d.ts
```typescript
interface Env {
  // ... existing
  GUIDE_SESSION: DurableObjectNamespace<import('./src/durable-objects/GuideSession').GuideSession>;
}
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `apps/data-service/src/durable-objects/GuideSession.ts` | CREATE | Durable Object class |
| `apps/data-service/src/hono/routes/editor.ts` | CREATE | Hono routes for DO proxy |
| `apps/data-service/src/hono/app.ts` | MODIFY | Register editor routes |
| `apps/data-service/src/index.ts` | MODIFY | Export GuideSession |
| `apps/data-service/wrangler.jsonc` | MODIFY | Add DO binding + migration |
| `apps/data-service/worker-configuration.d.ts` | MODIFY | Add GUIDE_SESSION type |
| `apps/user-application/src/hooks/use-editor-session.ts` | CREATE | Session hook |
| `apps/user-application/src/routes/app/_authed/editor/$guideId.tsx` | MODIFY | Use session hook |
| `apps/user-application/src/components/editor/editor-header.tsx` | MODIFY | Add save button state |

---

---

## ⚠️ DECISION NEEDED: Auto-Save to DB?

### Option A: Explicit Save Only (Current)
```
User edits → Local → [3s] → DO (draft) → [Save button] → DB
```
- User MUST click "Save" to persist to DB
- Risk: User forgets, DO might be garbage collected after ~30 days inactivity
- UX: Clear "Unsaved" indicator needed

### Option B: Auto-Save to DB (Recommended)
```
User edits → Local → [3s] → DO → [30s inactivity OR tab close] → DB
```
- Automatic DB save after 30 seconds of inactivity
- Also saves on tab close / navigate away
- User never loses work
- UX: "All changes saved" - worry-free

**TODO**: Decide which option and implement accordingly.

---

## Testing Checklist

- [ ] Open editor → DO initializes with DB data
- [ ] Make annotation → DO updates (check storage)
- [ ] Refresh page → Draft persists
- [ ] Click Save → DB updated
- [ ] Open in new tab → See saved changes
- [ ] Make changes, close without saving → Draft persists
- [ ] Discard draft → Reverts to DB state

---

## Implementation Status: ✅ COMPLETE

All files have been created/modified:

### Backend (data-service)
- ✅ `src/durable-objects/GuideSession.ts` - Durable Object class
- ✅ `src/hono/routes/editor.ts` - Hono routes for DO proxy
- ✅ `src/hono/app.ts` - Registered editor routes
- ✅ `src/index.ts` - Exported GuideSession
- ✅ `wrangler.jsonc` - Added DO binding + migration
- ✅ `service-bindings.d.ts` - Added GUIDE_SESSION type

### Frontend (user-application)
- ✅ `src/hooks/use-editor-session.ts` - Session hook
- ✅ `worker/trpc/routers/editor.ts` - tRPC router for session
- ✅ `worker/trpc/router.ts` - Registered editor router
- ✅ `src/routes/app/_authed/editor/$guideId.tsx` - Uses session hook
- ✅ `src/components/editor/editor-header.tsx` - Save button + status

### Next Steps
1. Deploy data-service with `wrangler deploy --env stage`
2. Deploy user-application
3. Test the editor flow

---

## Future: Phase 2 (WebSockets)

When ready for real-time collaboration:
1. Upgrade DO to accept WebSocket connections
2. Replace debounced HTTP with WebSocket messages
3. Broadcast changes to all connected clients
4. Add cursor presence indicators

The architecture above is designed to make this upgrade seamless.

