## System overview (review request)

- Monorepo
- apps/
  - user-application: React + TanStack Router + TanStack Query
    - tRPC client
    - Auth via data-ops
  - data-service: Hono
    - Webhooks
    - Queues
    - Workflow execution
    - R2 storage
    - RPC methods
  - browser-extension
- packages/
  - data-ops
    - Zod schemas
    - Queries
    - Better Auth plugin

Please review:
- boundaries between apps and packages
- data ownership & schema coupling
- auth flow & security risks
- async workflow & failure modes
- scaling & maintainability risks