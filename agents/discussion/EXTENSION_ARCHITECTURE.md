# Extension Architecture & Auth Strategy

## Waarom "https://internal/..." URLs?

In de `recording.ts` router zie je:
```typescript
ctx.env.BACKEND_SERVICE.fetch(
    new Request("https://internal/guides/start", ...)
)
```

**Uitleg**: Dit is een Cloudflare Workers **Service Binding**. 

- `BACKEND_SERVICE` is een directe verbinding naar `data-service` (geen internet)
- De hostname (`internal`) maakt niet uit - Cloudflare negeert deze
- Alleen het **path** (`/guides/start`) wordt gebruikt
- Het is ~10x sneller dan een echte HTTP call

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Network                        │
│                                                              │
│  ┌─────────────────┐  Service Binding  ┌─────────────────┐  │
│  │ user-application│ ←───────────────→ │  data-service   │  │
│  │                 │   (intern, snel)   │                 │  │
│  └─────────────────┘                   └─────────────────┘  │
│           ↑                                                  │
└───────────│──────────────────────────────────────────────────┘
            │ tRPC (internet)
            │
    ┌───────────────┐
    │   Extension   │
    └───────────────┘
```

De hostname kan ook `https://placeholder/...` of `https://x/...` zijn - het maakt niet uit.

---

## Complete Data Flow

### 1. Start Recording
```
Extension                     user-application                    data-service
    │                               │                                  │
    ├─ trpc.recording.start() ─────►│                                  │
    │                               ├─ BACKEND_SERVICE.fetch ─────────►│
    │                               │   POST /guides/start             │
    │                               │                                  ├─ Insert guide (status: 'recording')
    │                               │◄─────────────────────────────────┤
    │◄──────────────────────────────┤   { guideId, userId }            │
    │                               │                                  │
    ├─ chrome.storage.local.set()   │                                  │
    │   { guideId, userId, ... }    │                                  │
```

### 2. Per Click (Screenshot)
```
Extension                     user-application                    data-service
    │                               │                                  │
    ├─ captureVisibleTab() (PNG)    │                                  │
    ├─ convertToWebP() (85%)        │                                  │
    │                               │                                  │
    ├─ trpc.images.upload() ───────►│                                  │
    │   { key, dataUrl }            ├─ BACKEND_SERVICE.fetch ─────────►│
    │                               │   POST /images/upload            │
    │                               │                                  ├─ Store in R2
    │◄──────────────────────────────┤◄─────────────────────────────────┤
    │                               │                                  │
    ├─ chrome.storage.local         │                                  │
    │   steps.push(newStep)         │                                  │
```

### 3. Stop Recording
```
Extension                     user-application                    data-service
    │                               │                                  │
    ├─ trpc.recording.complete() ──►│                                  │
    │   { guideId, title, steps }   ├─ BACKEND_SERVICE.fetch ─────────►│
    │                               │   POST /guides/:id/complete      │
    │                               │                                  ├─ Update guide
    │                               │                                  ├─ Queue.send(steps)
    │◄──────────────────────────────┤◄─────────────────────────────────┤
    │                               │                                  │
    ├─ chrome.storage.local.clear() │                          Queue Consumer
    │                               │                                  │
    │                               │                                  ├─ Insert steps
    │                               │                                  ├─ Set status: 'draft'
```

### 4. Discard Recording
```
Extension                     user-application                    data-service
    │                               │                                  │
    ├─ trpc.recording.discard() ───►│                                  │
    │   { guideId }                 ├─ BACKEND_SERVICE.fetch ─────────►│
    │                               │   DELETE /guides/:id             │
    │                               │                                  ├─ Delete steps
    │                               │                                  ├─ Delete guide
    │                               │                                  ├─ Delete R2 images
    │◄──────────────────────────────┤◄─────────────────────────────────┤
```

---

## Auth Strategy

### Huidige Situatie
- Auth is nog niet geïmplementeerd
- `userId` is hardcoded in `data-service`
- Extension werkt zonder authenticatie

### Recommended: Cookie-based Auth

**Waarom cookies?**
1. Extension en frontend delen hetzelfde domain (`*.stepps.ai`)
2. Better-auth (jouw auth library) ondersteunt cookies
3. Geen token management in extension nodig

**Flow:**

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Flow                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User opent extension (niet ingelogd)                        │
│     └─► Extension toont "Login" button                          │
│                                                                  │
│  2. User klikt "Login"                                          │
│     └─► chrome.tabs.create({ url: 'https://app.stepps.ai/login'})│
│                                                                  │
│  3. User logt in op webapp (Google OAuth / email)               │
│     └─► Better-auth set HttpOnly cookie op *.stepps.ai          │
│                                                                  │
│  4. User keert terug naar extension                             │
│     └─► Extension calls trpc met credentials: 'include'         │
│     └─► Cookie wordt automatisch meegestuurd                    │
│     └─► Auth middleware valideert session                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Implementatie Stappen

#### 1. tRPC Client met Cookies
```typescript
// browser-extension/src/lib/trpc.ts
export const trpc = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: TRPC_URL,
            fetch: (url, options) => fetch(url, {
                ...options,
                credentials: 'include', // Stuur cookies mee
            }),
        }),
    ],
});
```

#### 2. Auth Middleware Activeren (user-application)
```typescript
// worker/hono/app.ts
const authMiddleware = createMiddleware(async (c, next) => {
    const auth = getAuth(c.env);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    
    if (!session?.user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    
    c.set("userId", session.user.id);
    await next();
});

App.all("/trpc/*", authMiddleware, (c) => { ... });
```

#### 3. Extension Login Check
```typescript
// browser-extension/src/lib/auth.ts
export async function checkAuth(): Promise<boolean> {
    try {
        // Call een authenticated endpoint
        await trpc.guides.getAll.query();
        return true;
    } catch {
        return false;
    }
}

export function openLogin() {
    chrome.tabs.create({ url: `${USER_APP_URL.stage}/login` });
}
```

#### 4. SidePanel met Auth State
```tsx
// browser-extension/src/sidepanel/SidePanelApp.tsx
const [isLoggedIn, setIsLoggedIn] = useState(false);

useEffect(() => {
    checkAuth().then(setIsLoggedIn);
}, []);

if (!isLoggedIn) {
    return <LoginPrompt onLogin={openLogin} />;
}
```

### CORS Configuratie

User-application moet CORS headers toestaan voor extension:

```typescript
// worker/hono/app.ts
import { cors } from 'hono/cors';

App.use('*', cors({
    origin: [
        'chrome-extension://YOUR_EXTENSION_ID',
        'https://app.stepps.ai',
    ],
    credentials: true,
}));
```

---

## Config Files Overzicht

| File | Doel |
|------|------|
| `browser-extension/src/lib/config.ts` | URLs voor stage/production |
| `browser-extension/src/lib/trpc.ts` | tRPC client setup |
| `browser-extension/src/lib/constants.ts` | Legacy, re-exports IMAGES_URL |

---

## Checklist: Auth Implementatie

- [ ] Better-auth activeren in user-application
- [ ] CORS configureren voor extension
- [ ] `credentials: 'include'` in tRPC client
- [ ] Login flow in extension sidepanel
- [ ] Auth check bij extension startup
- [ ] userId uit session halen in recording router

