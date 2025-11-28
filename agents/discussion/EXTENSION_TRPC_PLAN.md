# Extension tRPC Migration Plan

## Doel
Extension gebruikt tRPC via `user-application`, zelfde als frontend.

## Architectuur

```
┌─────────────────────┐                    ┌──────────────────┐
│  Browser Extension  │ ──── tRPC ────────►│  user-application│
└─────────────────────┘                    │  - recording.*   │
                                           │  - images.*      │
┌─────────────────────┐                    │  - guides.*      │
│    Frontend App     │ ──── tRPC ────────►│  - steps.*       │
└─────────────────────┘                    └────────┬─────────┘
                                                    │
                                           BACKEND_SERVICE (al geconfigureerd)
                                                    │
                                                    ▼
                                           ┌──────────────────┐
                                           │   data-service   │
                                           │  - /guides/*     │
                                           │  - /images/*     │
                                           │  - R2 + Queue    │
                                           └──────────────────┘
```

## Stappen

### 1. user-application: Recording Router
```typescript
// worker/trpc/routers/recording.ts
recording.start()      → BACKEND_SERVICE.fetch('/guides/start')
recording.complete()   → BACKEND_SERVICE.fetch('/guides/:id/complete')
recording.discard()    → BACKEND_SERVICE.fetch('/guides/:id', DELETE)
```

### 2. user-application: Images Router
```typescript
// worker/trpc/routers/images.ts
images.upload()        → BACKEND_SERVICE.fetch('/images/upload')
```

### 3. browser-extension: tRPC Client
```typescript
// src/lib/trpc.ts
trpc client → user-application/trpc
```

### 4. browser-extension: Migrate background.ts
```typescript
// VOOR: fetch(`${API_BASE_URL}/guides/start`)
// NA:   trpc.recording.start.mutate()
```

## Checklist

### user-application
- [ ] `recordingRouter` maken
- [ ] `imagesRouter` maken
- [ ] Registreren in main router

### browser-extension
- [ ] @trpc/client dependency
- [ ] tRPC client setup
- [ ] background.ts migreren

## Niet in scope
- Auth (later)
- WebSocket
- Offline support

