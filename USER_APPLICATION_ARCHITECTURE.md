# User-Application Architectuur — Volledige Referentie

Alles wat je nodig hebt om deze architectuur te repliceren in een ander project.

---

## Stack Overzicht

| Laag | Technologie | Versie |
|---|---|---|
| **Runtime** | Cloudflare Workers | Wrangler v3 |
| **Frontend Framework** | React | 19 |
| **Routing** | TanStack Router | File-based, auto code-splitting |
| **Server State** | TanStack React Query + tRPC | v5 + v11 |
| **API Layer** | tRPC | 11 (httpBatchLink) |
| **BFF Framework** | Hono | 4.8 |
| **Auth** | Better-Auth | Singleton factory pattern |
| **CSS** | Tailwind CSS | v4 (Vite plugin) |
| **UI Components** | Radix UI + shadcn/ui | new-york style |
| **Build Tool** | Vite | 6 |
| **Database** | PostgreSQL + Drizzle ORM | Verse DB connectie per request |
| **Validation** | Zod | Overal — frontend, backend, tRPC |
| **Animaties** | Framer Motion + GSAP | Editor + carousel |

---

## Hoe Het In Elkaar Zit

### Eén Worker doet alles

De Cloudflare Worker in `worker/index.ts` serveert zowel de **React SPA** als de **API**:

```
Browser request
  ↓
Cloudflare Worker
  ├── /api/auth/*    → Better-Auth (login, sessie, OAuth)
  ├── /trpc/*        → tRPC handlers (alle data operaties)
  └── /* (rest)      → Vite-built React SPA (static assets)
```

Dit is het BFF-pattern (Backend-For-Frontend). De Worker IS de server.

### Wrangler Config (hoe assets + API samenwerken)

```jsonc
// wrangler.jsonc
{
  "main": "worker/index.ts",
  "assets": {
    "not_found_handling": "single-page-application",
    // Routes die NIET naar de SPA gaan maar naar de Worker:
    "run_worker_first": ["/api/auth/*", "/api/webhooks/*", "/trpc/*"]
  },
  "compatibility_flags": ["nodejs_compat"],
  "services": [
    {
      "binding": "BACKEND_SERVICE",
      "service": "data-service"  // Aparte Worker voor R2, queues, workflows
    }
  ]
}
```

`not_found_handling: "single-page-application"` → elke onbekende route krijgt `index.html` (TanStack Router handelt client-side routing af).

`run_worker_first` → deze paden gaan eerst door de Worker code (Hono), niet naar static assets.

---

## Worker Laag (BFF)

### Entry Point

```typescript
// worker/index.ts
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    // Verse DB connectie per request (edge = geen connection pooling)
    const db = initDatabase(env.DATABASE_URL);

    // Hono app handelt alles af
    return app.fetch(request, { ...env, db }, ctx);
  }
};
```

### Hono Middleware Stack

```typescript
// worker/hono/app.ts

const app = new Hono();

// 1. Auth routes (openbaar, rate limited)
app.on(["POST", "GET"], "/api/auth/*", authRateLimiter, authHandler);

// 2. Publieke tRPC routes (geen login nodig, IP rate limited)
app.use("/trpc/publicGuides.*", publicRateLimiter, publicTrpcHandler);
app.use("/trpc/webinar.*", publicRateLimiter, publicTrpcHandler);

// 3. Session-only routes (login nodig, geen betaalcheck)
app.use("/trpc/users.getMePublic", authMiddleware, authenticatedTrpcHandler);
app.use("/trpc/config.getPublicConfig", authMiddleware, authenticatedTrpcHandler);

// 4. Beschermde routes (login + betaalcheck + rate limit)
app.use("/trpc/*", authMiddleware, accessMiddleware, trpcRateLimiter, authenticatedTrpcHandler);
```

**Drie lagen van bescherming:**
1. **authMiddleware** → sessie valideren, `userId` in context zetten
2. **accessMiddleware** → betaalstatus checken (402 als niet betaald)
3. **rateLimiter** → Cloudflare native rate limiting per user of IP

### Rate Limiting

```typescript
// Cloudflare's eigen rate limiting (geen externe dependency)
const rateLimiter = cloudflareRateLimiter({
  rateLimitBinding: env.TRPC_RATE_LIMITER,  // Binding in wrangler.jsonc
  keyGenerator: (c) => c.get("userId") || c.req.header("cf-connecting-ip"),
});
```

Geconfigureerd in `wrangler.jsonc`:

```jsonc
"rate_limits": [
  { "binding": "AUTH_RATE_LIMITER", "simple": { "limit": 20, "period": 60 }},
  { "binding": "TRPC_RATE_LIMITER", "simple": { "limit": 20, "period": 60 }}
]
```

### Auth Middleware

```typescript
// worker/hono/helpers/auth-instance.ts

const authMiddleware = async (c, next) => {
  const auth = getAuthInstance(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user?.id) return c.json({ error: "Unauthorized" }, 401);

  c.set("userId", session.user.id);
  c.set("auth", auth);
  await next();
};

const accessMiddleware = async (c, next) => {
  // Whitelist bepaalde procedures
  const isPublicProcedure = url.includes("users.getMePublic") || ...;
  if (isPublicProcedure) return await next();

  // Check betaalstatus
  const access = await checkUserAccess(db, userId);
  if (access.status === "payment_required") return c.json({ error }, 402);

  await next();
};
```

### Auth Factory (Better-Auth)

```typescript
// Auth singleton met health check caching
let authInstance = null;
let healthCheckCache = { result: null, timestamp: 0 };
const HEALTH_CHECK_TTL = 60_000; // 60 sec

function getAuthInstance(env) {
  if (authInstance) return authInstance;

  authInstance = getAuth({
    database: env.DATABASE_URL,
    secret: env.BETTER_AUTH_SECRET,
    socialProviders: {
      google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }
    },
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url }) => {
        // Via backend service RPC
        await env.BACKEND_SERVICE.sendPasswordResetEmail(user.email, user.name, url);
      }
    }
  });

  return authInstance;
}
```

---

## tRPC Laag

### Initialisatie

```typescript
// worker/trpc/trpc-instance.ts
import { initTRPC } from "@trpc/server";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
```

### Context

```typescript
// worker/trpc/context.ts
export type Context = {
  req: Request;
  env: ServiceBindings;        // Wrangler env (DB, BACKEND_SERVICE, etc.)
  workerCtx: ExecutionContext;  // Cloudflare ExecutionContext
  userInfo: { userId: string }; // Van auth middleware
};
```

### Router Compositie

```typescript
// worker/trpc/router.ts
export const appRouter = router({
  guides:        guidesRouter,
  folders:       foldersRouter,
  images:        imagesRouter,
  users:         usersRouter,
  guideExports:  guideExportsRouter,
  editor:        editorRouter,
  recording:     recordingRouter,
  notifications: notificationsRouter,
  publicGuides:  publicGuidesRouter,
  config:        configRouter,
  webinar:       webinarRouter,
  team:          teamRouter,
  pricing:       pricingRouter,
});

export type AppRouter = typeof appRouter;
```

### Router Pattern (voorbeeld)

```typescript
// worker/trpc/routers/guides.ts
export const guidesRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const guides = await getGuidesByUser(ctx.env.db, ctx.userInfo.userId);
    return guides.map(g => transformGuideWithUrls(g, ctx.env.ASSETS_URL));
  }),

  create: publicProcedure
    .input(createGuideSchema)  // Zod schema uit @repo/data-ops
    .mutation(async ({ ctx, input }) => {
      return await createGuide(ctx.env.db, { ...input, userId: ctx.userInfo.userId });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // RPC naar backend voor R2 cleanup
      await ctx.env.BACKEND_SERVICE.deleteGuideWithImages(input.id);
      return { success: true };
    }),
});
```

**Twee patronen voor data:**
1. **Direct DB** → queries uit `@repo/data-ops/queries` voor simpele CRUD
2. **Via RPC** → `ctx.env.BACKEND_SERVICE.methodName()` voor R2/queue/workflow operaties

### tRPC Handler Factory

```typescript
// worker/hono/helpers/trpc-routes.ts
const authenticatedTrpcHandler = (c) => {
  return fetchRequestHandler({
    endpoint: "/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: () => ({
      req: c.req.raw,
      env: c.env,
      workerCtx: c.executionCtx,
      userInfo: { userId: c.get("userId") },
    }),
  });
};
```

---

## Frontend Architectuur

### Entry Point

```typescript
// src/main.tsx
import { createRouter } from "./router";

const router = createRouter();
const root = ReactDOM.createRoot(document.getElementById("app")!);
root.render(<RouterProvider router={router} />);
```

### Router + Query Client Setup

```typescript
// src/router.tsx
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";  // Auto-generated!

export function createRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,       // 5 min
        gcTime: 30 * 60 * 1000,          // 30 min
        retry: 2,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: { retry: 1 },
    },
  });

  const trpc = createTRPCOptionsProxy<AppRouter>({ client: trpcClient, queryClient });

  return createTanStackRouter({
    routeTree,
    context: { trpc, queryClient },          // Beschikbaar in elke route
    defaultPendingComponent: LoadingSpinner,
    defaultErrorComponent: ErrorComponent,
    Wrap: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    ),
  });
}
```

### tRPC Client (frontend)

```typescript
// src/lib/trpc-client.ts
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/worker/trpc/router";

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({ url: "/trpc" }),  // Relatieve URL — zelfde Worker
  ],
});
```

Geen auth headers nodig — cookies-based via Better-Auth.

### File-Based Routing

TanStack Router genereert routes automatisch uit de bestandsstructuur:

```
src/routes/
├── __root.tsx                          → Root layout (ThemeProvider, Toaster)
├── index.tsx                           → / (landing page)
├── auth/
│   ├── login.tsx                       → /auth/login
│   ├── forgot-password.tsx             → /auth/forgot-password
│   ├── reset-password.tsx              → /auth/reset-password
│   └── verify-email.tsx                → /auth/verify-email
├── app/
│   ├── _authed.tsx                     → Layout wrapper (auth guard)
│   └── _authed/
│       ├── index.tsx                   → /app (dashboard)
│       ├── stepps/
│       │   ├── index.tsx               → /app/stepps (guides lijst)
│       │   └── $guideId.tsx            → /app/stepps/:guideId (viewer)
│       ├── editor/
│       │   └── $guideId.tsx            → /app/editor/:guideId
│       ├── settings.tsx                → /app/settings
│       └── carousel/
│           └── editor.tsx              → /app/carousel/editor
├── shared/
│   └── $guideId.tsx                    → /shared/:guideId (publieke viewer)
└── guides.tsx                          → /guides (publieke browse)
```

**Conventies:**
- `_authed.tsx` → layout route (underscore prefix = niet in URL)
- `$guideId.tsx` → dynamic segment
- `index.tsx` → index route voor die directory

### Auth Guard (protected routes)

```typescript
// src/routes/app/_authed.tsx
export const Route = createFileRoute("/app/_authed")({
  beforeLoad: async ({ context, location }) => {
    // 1. Sessie check
    const session = await getSessionCached();
    if (!session) {
      throw redirect({ to: "/auth/login", search: { redirect: location.href } });
    }

    // 2. Betaalstatus check
    const access = await getAccessCached(context.trpc, context.queryClient);
    if (!access.hasAccess && !location.pathname.includes("/upgrade")) {
      throw redirect({ to: "/app/upgrade" });
    }
  },
  component: AuthedLayout,
});
```

### Auth Caching

```typescript
// src/lib/auth-helpers.ts
const SESSION_CACHE_TTL = 5 * 60 * 1000;   // 5 min
const ACCESS_CACHE_TTL = 2 * 60 * 1000;    // 2 min

let sessionCache = { data: null, timestamp: 0 };

export async function getSessionCached() {
  if (Date.now() - sessionCache.timestamp < SESSION_CACHE_TTL) {
    return sessionCache.data;
  }

  const session = await authClient.getSession();
  sessionCache = { data: session.data, timestamp: Date.now() };
  return session.data;
}
```

### Data Fetching Pattern (in routes)

```typescript
// src/routes/app/_authed/stepps/index.tsx
export const Route = createFileRoute("/app/_authed/stepps/")({
  // Prefetch voor instant navigatie
  beforeLoad: ({ context }) => {
    context.queryClient.ensureQueryData(
      context.trpc.guides.getAll.queryOptions()
    );
    context.queryClient.ensureQueryData(
      context.trpc.folders.getAll.queryOptions()
    );
  },

  component: SteppsPage,
});

function SteppsPage() {
  const { trpc, queryClient } = Route.useRouteContext();

  // Server state
  const { data: guides } = useQuery(trpc.guides.getAll.queryOptions());

  // Mutations
  const deleteMutation = useMutation({
    ...trpc.guides.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guides"] });
      toast.success("Guide verwijderd");
    },
    onError: (err) => toast.error(err.message),
  });

  return <GuidesList guides={guides} onDelete={(id) => deleteMutation.mutate({ id })} />;
}
```

---

## Styling & UI

### Tailwind CSS v4

```typescript
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), ...],
});
```

Geen `tailwind.config.js` nodig met v4 — alles via CSS variables:

```css
/* src/styles/globals.css */
@import "tailwindcss";

:root {
  /* Brand kleuren */
  --primary: oklch(0.55 0.18 275);        /* Indigo */
  --primary-foreground: oklch(0.985 0 0);
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0.015 285);

  /* Sidebar */
  --sidebar-background: oklch(0.97 0.005 285);
  --sidebar-foreground: oklch(0.35 0.04 285);

  /* Fonts */
  --font-body: "Inter", sans-serif;
  --font-display: "Space Grotesk", sans-serif;
}

.dark {
  --primary: oklch(0.7 0.15 275);
  --background: oklch(0.145 0.015 285);
  /* ... dark overrides */
}
```

### shadcn/ui Setup

```jsonc
// components.json
{
  "style": "new-york",
  "tailwind": { "cssVariables": true },
  "aliases": {
    "components": "@/components",
    "utils": "@/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

41 UI componenten in `src/components/ui/`:
- Dialog, Sheet, Dropdown, Select, Tabs, Accordion
- Button, Input, Textarea, Label, Checkbox, Switch
- Table, Card, Badge, Avatar, Tooltip
- Sidebar, Breadcrumb, Separator
- Toast (via Sonner)
- En meer...

### Theme Provider

```typescript
// src/components/theme-provider.tsx
const ThemeContext = createContext<{ theme: string; setTheme: (t) => void }>();

function ThemeProvider({ children, defaultTheme = "system" }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("ui-theme") || defaultTheme
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: (t) => {
      localStorage.setItem("ui-theme", t);
      setTheme(t);
    }}}>
      {children}
    </ThemeContext.Provider>
  );
}
```

---

## Layout Structuur

### Dashboard Layout

```typescript
// src/routes/app/_authed.tsx (component)
function AuthedLayout() {
  const isFullScreen = /* editor, viewer, carousel routes */;

  if (isFullScreen) return <Outlet />;  // Geen sidebar

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="bg-muted/30 rounded-tl-2xl">
        <DashboardHeader />
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

### Sidebar

```typescript
// src/components/common/app-sidebar.tsx
<Sidebar collapsible="icon">
  <SidebarHeader>
    <Logo /> <SidebarTrigger />
  </SidebarHeader>
  <SidebarContent>
    <NavItem icon={LayoutDashboard} to="/app" label="Dashboard" />
    <NavItem icon={BookOpen} to="/app/stepps" label="My Stepps" />
    <NavItem icon={Settings} to="/app/settings" label="Settings" />
  </SidebarContent>
  <SidebarFooter>
    <UserProfile />
  </SidebarFooter>
</Sidebar>
```

---

## Extension Communicatie

```typescript
// src/lib/extension.ts
const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID;

export function triggerExtensionSidePanel() {
  chrome.runtime.sendMessage(EXTENSION_ID, { type: "OPEN_SIDE_PANEL" });
}

export function notifyExtensionAuthChanged() {
  chrome.runtime.sendMessage(EXTENSION_ID, { type: "AUTH_STATE_CHANGED" });
}
```

Werkt omdat de extension `externally_connectable` toestaat voor `*.stepps.ai`.

---

## Environment Variables

### Build-time (Vite — beschikbaar in frontend)

```
VITE_AUTH_URL=https://stage.stepps.ai     (of https://stepps.ai)
VITE_EXTENSION_ID_PROD=abc123
VITE_EXTENSION_ID_STAGE=def456
VITE_CREEM_EU_PRODUCT_PERSONAL=prod_xxx
```

### Runtime (Wrangler — alleen in Worker)

```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
CREEM_API_KEY=xxx
CREEM_WEBHOOK_SECRET=xxx
ASSETS_URL=https://api.stage.stepps.ai    (R2 CDN)
```

### Service Bindings

```
BACKEND_SERVICE → data-service Worker (RPC calls)
```

---

## Deployment

### Scripts

```bash
# Development
pnpm dev                          # Vite dev server op port 3000

# Stage
pnpm build                        # Vite build (stage vars)
pnpm stage:deploy                 # Build + wrangler deploy

# Production
pnpm production:build             # Vite build (prod vars)
pnpm production:deploy            # Build + wrangler deploy --env production
```

### Vite Build Output

```
dist/
├── client/                       # React SPA (static files)
│   ├── index.html
│   └── assets/
│       ├── index-[hash].js       # App bundle
│       ├── index-[hash].css      # Styles
│       └── [chunk]-[hash].js     # Code-split route chunks
└── worker/                       # Compiled Worker
```

Cloudflare serveert `dist/client/` als static assets en `dist/worker/` als de Worker.

---

## Samenvatting: Zo Repliceer Je Dit

### 1. Project Setup

```bash
pnpm create cloudflare@latest my-app
cd my-app
pnpm add react react-dom @tanstack/react-router @tanstack/react-query
pnpm add @trpc/server @trpc/client hono better-auth
pnpm add -D vite @vitejs/plugin-react tailwindcss @tailwindcss/vite
pnpm add -D @tanstack/router-plugin wrangler
```

### 2. Vite Config

```typescript
// vite.config.ts
import { cloudflare } from "@cloudflare/vite-plugin";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    TanStackRouterVite(),
    react(),
    tailwindcss(),
    cloudflare(),
  ],
});
```

### 3. Wrangler Config

```jsonc
{
  "main": "worker/index.ts",
  "assets": {
    "not_found_handling": "single-page-application",
    "run_worker_first": ["/api/*", "/trpc/*"]
  },
  "compatibility_flags": ["nodejs_compat"]
}
```

### 4. Mappenstructuur

```
my-app/
├── worker/
│   ├── index.ts          → DB init + Hono app
│   ├── hono/app.ts       → Middleware stack
│   └── trpc/
│       ├── router.ts     → Router compositie
│       ├── context.ts    → Context type
│       └── routers/      → Feature routers
├── src/
│   ├── main.tsx          → React entry
│   ├── router.tsx        → TanStack Router + QueryClient
│   ├── routes/           → File-based routes
│   ├── components/
│   │   └── ui/           → shadcn/ui components
│   ├── lib/
│   │   └── trpc-client.ts
│   └── styles/globals.css
├── vite.config.ts
├── wrangler.jsonc
└── components.json       → shadcn/ui config
```

### 5. Key Patterns om te onthouden

| Pattern | Hoe |
|---|---|
| **Auth guard** | `beforeLoad` in layout route → redirect als geen sessie |
| **Data prefetch** | `ensureQueryData()` in `beforeLoad` → instant navigatie |
| **Server calls** | `useQuery(trpc.x.y.queryOptions())` → type-safe, cached |
| **Mutations** | `useMutation(trpc.x.y.mutationOptions())` + `invalidateQueries` |
| **R2/Queue operaties** | Via `ctx.env.BACKEND_SERVICE.method()` (service binding RPC) |
| **Rate limiting** | Cloudflare native bindings, per route type |
| **Theming** | CSS variables + `classList.add("dark")` |
| **Toasts** | Sonner library, `toast.success()` / `toast.error()` |
| **Forms** | react-hook-form + zodResolver + Zod schema |
