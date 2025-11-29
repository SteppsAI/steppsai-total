# tRPC Integration Status

> **Laatste update:** Voltooid

---

## ✅ Volledig Geïntegreerd

### Backend (data-ops)
| File | Status | Beschrijving |
|------|--------|--------------|
| `packages/data-ops/src/queries/folders.ts` | ✅ | CRUD queries voor folders |
| `packages/data-ops/src/queries/index.ts` | ✅ | Export folders |

### Backend (worker/trpc)
| File | Status | Beschrijving |
|------|--------|--------------|
| `worker/trpc/routers/folders.ts` | ✅ | Folders tRPC router |
| `worker/trpc/router.ts` | ✅ | Folders router registratie |

### Frontend Types
| File | Status | Beschrijving |
|------|--------|--------------|
| `src/types/db.ts` | ✅ | camelCase types |
| `src/types/test-data.ts` | ✅ | camelCase test data |

### Frontend Hooks
| File | Status | Beschrijving |
|------|--------|--------------|
| `src/hooks/use-stepps.ts` | ✅ | tRPC mutations (create, update, delete) |
| `src/hooks/use-folders.ts` | ✅ | tRPC mutations (create, update, delete) |

### Frontend Routes
| Route | Status | Pattern |
|-------|--------|---------|
| `/app/_authed/index.tsx` | ✅ | prefetchQuery + useSuspenseQuery |
| `/app/_authed/stepps/index.tsx` | ✅ | prefetchQuery + useSuspenseQuery |
| `/app/_authed/stepps/$guideId.tsx` | ✅ | prefetchQuery + useSuspenseQuery |
| `/app/_authed/editor/$guideId.tsx` | ✅ | prefetchQuery + useSuspenseQuery + mutations |

---

## Data Fetching Pattern

```tsx
// 1. Route met loader
export const Route = createFileRoute("/app/_authed/")({
  component: Dashboard,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery(context.trpc.guides.getAll.queryOptions()),
      context.queryClient.prefetchQuery(context.trpc.folders.getAll.queryOptions()),
    ]);
  },
});

// 2. Component met useSuspenseQuery
function Dashboard() {
  const { data: guides } = useSuspenseQuery(trpc.guides.getAll.queryOptions());
  const { data: folders } = useSuspenseQuery(trpc.folders.getAll.queryOptions());
  
  // Mutations
  const deleteMutation = useMutation({
    ...trpc.guides.delete.mutationOptions(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["guides"] }),
  });
  
  // ...
}
```

---

## Mutations Hook Pattern

```tsx
// src/hooks/use-folders.ts
export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    ...trpc.folders.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}
```

---

## Test User ID

```typescript
const TEST_USER_ID = "f1d84914-ec7c-4b1a-9a89-eaeff6b2f366";
```

Hardcoded in:
- `worker/trpc/routers/guides.ts:15`
- `worker/trpc/routers/folders.ts:12`

**TODO:** Vervang met `ctx.userInfo.userId` wanneer auth is geïmplementeerd.

---

## Type Conversie

Backend retourneert types met optional fields (`folderId?: string | null | undefined`).
Frontend cast naar lokale types waar nodig:

```tsx
const recentStepps = (guides ?? []).slice(0, 4) as Guide[];
```

---

## Wat werkt nu

1. **Dashboard** (`/app`)
   - Laadt guides en folders via tRPC
   - Delete/rename folders
   - Delete/move guides

2. **All Stepps** (`/app/stepps`)
   - Laadt guides en folders via tRPC
   - Create/delete/rename folders
   - Delete/move/visibility toggle guides

3. **Guide View** (`/app/stepps/$guideId`)
   - Laadt guide met steps via tRPC

4. **Editor** (`/app/editor/$guideId`)
   - Laadt guide met steps via tRPC
   - Save title changes
   - Update step captions
   - Update annotations/overlays
   - Add/delete/reorder steps

---

## Nog te doen (buiten scope Step 4)

- [ ] Auth integratie (`ctx.userInfo.userId`)
- [ ] Export functionality (PDF, Markdown, Word)
- [ ] Share functionality (email invites)
- [ ] User settings page
- [ ] Billing/Stripe integration
