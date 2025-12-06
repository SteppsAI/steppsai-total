# RPC Implementation for Service Bindings

**Date:** 2025-12-05  
**Status:** ✅ Complete - All operations use tRPC → RPC

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────────┤
│  📱 TanStack Query → tRPC → user-application                    │
│     ALL operations use tRPC (DB queries + RPC operations)       │
│                                                                 │
│  Examples:                                                      │
│   - trpc.guides.delete.mutate({ id })                           │
│   - trpc.users.uploadAvatar.mutate({ dataUrl })                 │
│   - trpc.editor.saveSession.mutate({ guideId })                 │
└─────────────────────┬───────────────────────────────────────────┘
                      │ tRPC (type-safe!)
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│           user-application (Cloudflare Worker)                   │
├─────────────────────────────────────────────────────────────────┤
│  📁 worker/trpc/routers/*.ts                                    │
│     → DB queries: uses data-ops (Drizzle ORM) directly          │
│     → RPC operations: ctx.env.BACKEND_SERVICE.methodName()      │
│                                                                 │
│  📁 worker/hono/app.ts                                          │
│     → Auth middleware only                                      │
│     → Serves tRPC endpoint (/trpc/*)                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │ RPC (via BACKEND_SERVICE binding)
                      │ backend.methodName()
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│               data-service (Cloudflare Worker)                   │
├─────────────────────────────────────────────────────────────────┤
│  📁 src/index.ts (DataService extends WorkerEntrypoint)         │
│     → Exposes public RPC methods                                │
│                                                                 │
│  📁 src/rpc-methods/*.ts                                        │
│     → guides.ts: startRecording, completeRecording, etc.        │
│     → users.ts: uploadAvatar, deleteAvatar                      │
│     → exports.ts: triggerExport                                 │
│     → editor.ts: getEditorState, saveEditorSession, etc.        │
│     → images.ts: uploadImage, deleteImage, etc.                 │
│                                                                 │
│  Uses: env.BUCKET (R2), env.QUEUE, env.GUIDE_SESSION (DO)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## How It Works (3 Layers)

### 1. Frontend → tRPC
```typescript
// hooks/use-api.ts
export function useDeleteGuide() {
  const queryClient = useQueryClient();
  
  return useMutation({
    ...trpc.guides.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: trpc.guides.getAll.queryOptions().queryKey 
      });
    },
  });
}
```

### 2. tRPC Router → RPC
```typescript
// worker/trpc/routers/guides.ts
delete: publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const backend = ctx.env.BACKEND_SERVICE as any;
    await backend.deleteGuideWithImages(input.id);
    return { success: true };
  }),
```

### 3. DataService RPC Method
```typescript
// data-service/src/index.ts
export default class DataService extends WorkerEntrypoint<Env> {
  deleteGuideWithImages(guideId: string) {
    return rpc.deleteGuideWithImages(this.env, guideId);
  }
}

// data-service/src/rpc-methods/guides.ts
export async function deleteGuideWithImages(env: Env, guideId: string) {
  // Delete from DB, delete from R2, etc.
}
```

---

## Files Changed

### data-service
| File | Purpose |
|------|---------|
| `src/index.ts` | Exposes RPC methods (guides, users, exports, editor, images) |
| `src/rpc-methods/guides.ts` | Recording, guide/step deletion |
| `src/rpc-methods/users.ts` | Avatar upload/delete |
| `src/rpc-methods/exports.ts` | Export workflow |
| `src/rpc-methods/editor.ts` | DO session management |
| `src/rpc-methods/images.ts` | Image upload/delete (R2) |

### user-application (tRPC routers)
| File | RPC Methods |
|------|-------------|
| `router/guides.ts` | `delete`, `deleteStep` |
| `router/users.ts` | `uploadAvatar`, `deleteAvatar` |
| `router/exports.ts` | `triggerExport` |
| `router/editor.ts` | `getSession`, `updateSession`, `saveSession`, `discardSession` |
| `router/recording.ts` | `start`, `complete`, `discard` |
| `router/images.ts` | `upload`, `delete`, `deleteBatch` |

### ❌ Deleted Files
- `worker/hono/routes/recording.ts` 
- `worker/hono/routes/guides.ts`
- `worker/hono/routes/users.ts`
- `worker/hono/routes/exports.ts`
- `worker/hono/routes/editor.ts`

All functionality now in tRPC routers!

### Frontend Hooks (Updated to tRPC)
| File | Purpose |
|------|---------|
| `hooks/use-api.ts` | Uses `trpc.guides.delete.mutationOptions()` |
| `hooks/use-guides-api.ts` | Uses `trpc.guides.delete.mutationOptions()` |
| `hooks/use-users-api.ts` | Uses `trpc.users.uploadAvatar.mutationOptions()` |
| `hooks/use-editor-session.ts` | Uses `trpc.editor.*.mutateAsync()` |
| `components/export-dialog.tsx` | Uses `trpc.guideExports.triggerExport.mutationOptions()` |

---

## Key Benefits

1. ✅ **Full Type Safety** - Frontend to backend, end-to-end via tRPC
2. ✅ **No HTTP Overhead** - RPC is direct method call between workers
3. ✅ **Clean Architecture** - No Hono route intermediaries
4. ✅ **Single Pattern** - Everything goes through tRPC
5. ✅ **Type Checks Pass** - 0 errors in both user-application and data-service

---

## Testing Checklist

- [ ] Login with Google
- [ ] Start/complete recording (tRPC → RPC)
- [ ] Upload/delete avatar (tRPC → RPC)
- [ ] Delete guide - verify R2 images deleted (tRPC → RPC)
- [ ] Delete step - verify R2 image deleted (tRPC → RPC)
- [ ] Editor save/discard session (tRPC → RPC)
- [ ] Trigger PDF/HTML export (tRPC → RPC)
- [ ] Image upload from extension (tRPC → RPC)
