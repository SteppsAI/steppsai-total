# Step 4: tRPC Integration Plan

> **Focus:** User-Application tRPC integratie (zonder auth - dat komt later)

## Beslissingen

| Vraag | Beslissing |
|-------|------------|
| Type casing | `camelCase` overal (frontend + backend). Backend transformeert naar snake_case voor DB |
| Data fetching | Route-level: `prefetchQuery` in loader → `useSuspenseQuery` in component → props naar children |
| Loading strategy | `useSuspenseQuery` - cleaner API, data is altijd beschikbaar |

---

## Pattern: Data Fetching

Gebaseerd op `link.$id.tsx` voorbeeld:

```tsx
// 1. Route met loader voor prefetch
export const Route = createFileRoute("/app/_authed/")({
  component: Dashboard,
  loader: async ({ context }) => {
    // Prefetch in parallel
    await Promise.all([
      context.queryClient.prefetchQuery(
        context.trpc.guides.getAll.queryOptions()
      ),
      context.queryClient.prefetchQuery(
        context.trpc.folders.getAll.queryOptions()
      ),
    ]);
  },
});

// 2. Component gebruikt useSuspenseQuery
function Dashboard() {
  const { trpc } = Route.useRouteContext();
  
  const { data: guides } = useSuspenseQuery(
    trpc.guides.getAll.queryOptions()
  );
  const { data: folders } = useSuspenseQuery(
    trpc.folders.getAll.queryOptions()
  );
  
  // 3. Props naar children
  return (
    <>
      <RecentStepps stepps={guides.slice(0, 4)} onDelete={...} />
      <FoldersSection folders={folders} onRename={...} />
    </>
  );
}
```

**Voordelen:**
- SSR-ready (data is al beschikbaar)
- Geen loading states nodig in components
- Type-safe door hele chain
- Children blijven "dumb" - makkelijk te testen

---

## Huidige Situatie

### ✅ Wat werkt
- tRPC setup in `router.tsx` met `createTRPCOptionsProxy`
- Backend routers: `guides`, `recording`, `images`
- Zod schemas voor guides, steps, folders
- TanStack Router + TanStack Query zijn geconfigureerd

### ❌ Wat mist
- `folders` queries in data-ops
- `folders` tRPC router
- Frontend integratie (alles gebruikt nog mock data)

---

## Fase 1: Backend - Folders Queries & Router

### 1.1 `packages/data-ops/src/queries/folders.ts`

```typescript
export async function createFolder(data: CreateFolderSchemaType): Promise<string>
export async function getFolder(folderId: string): Promise<Folder | null>
export async function getUserFolders(userId: string): Promise<FolderWithCount[]>
export async function updateFolder(folderId: string, name: string): Promise<void>
export async function deleteFolder(folderId: string): Promise<void>
```

### 1.2 `packages/data-ops/src/queries/index.ts`
```typescript
export * from "./folders";
```

### 1.3 `apps/user-application/worker/trpc/routers/folders.ts`

```typescript
export const foldersRouter = router({
  getAll: publicProcedure.query(),           // → getUserFolders(userId)
  getById: publicProcedure.input().query(),  // → getFolder(id)
  create: publicProcedure.input().mutation(), // → createFolder(data)
  update: publicProcedure.input().mutation(), // → updateFolder(id, name)
  delete: publicProcedure.input().mutation(), // → deleteFolder(id)
});
```

### 1.4 `apps/user-application/worker/trpc/router.ts`
```typescript
folders: foldersRouter,
```

---

## Fase 2: Frontend Types Alignment

### Update `src/types/db.ts` naar camelCase

```typescript
export interface Folder {
  id: string;
  userId: string;      // was: user_id
  name: string;
  createdAt: string;   // was: created_at
}

export interface Guide {
  id: string;
  userId: string;      // was: user_id
  folderId: string | null;  // was: folder_id
  title: string | null;
  // ... etc
}
```

---

## Fase 3: Frontend Integratie

### 3.1 Routes updaten

| Route | Changes |
|-------|---------|
| `/app/_authed/index.tsx` | prefetchQuery in loader, useSuspenseQuery, mutations |
| `/app/_authed/stepps/index.tsx` | Zelfde pattern |
| `/app/_authed/editor/$guideId.tsx` | Guide + steps via tRPC |

### 3.2 Hooks (optioneel houden)

De hooks in `use-stepps.ts` en `use-folders.ts` kunnen we:
- **Optie A:** Verwijderen - data komt via route context
- **Optie B:** Houden als thin wrappers voor mutations

**Keuze:** Optie B - mutations in hooks, queries in routes

---

## Implementatie Volgorde

### Nu: Backend Folders
1. [x] `packages/data-ops/src/queries/folders.ts`
2. [x] `packages/data-ops/src/queries/index.ts` - export
3. [x] `apps/user-application/worker/trpc/routers/folders.ts`
4. [x] `apps/user-application/worker/trpc/router.ts`

### Daarna: Frontend
5. [ ] Update `src/types/db.ts` naar camelCase
6. [ ] `/app/_authed/index.tsx` - Dashboard
7. [ ] Mutations in hooks

---

## Test User ID

Hardcoded voor development:
```typescript
const TEST_USER_ID = "f1d84914-ec7c-4b1a-9a89-eaeff6b2f366";
```

Gebruikt in:
- `worker/trpc/routers/guides.ts:15`
- `worker/trpc/routers/folders.ts` (nieuw)

---

## Vraag: `ctx.env.BACKEND_SERVICE`

**Conclusie:** Prima zo. Service bindings horen in worker code, niet in Hono routing.
