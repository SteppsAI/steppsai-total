# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SteppsAI is an edge-native full-stack monorepo for guide/step recording and management, built on Cloudflare Workers with PostgreSQL.

## Architecture

```
├── apps
│   ├── data-service          # Backend Worker (Hono, RPC, Workflows, Durable Objects)
│   ├── user-application      # Frontend (React + TanStack Router + tRPC) + BFF Worker
│   └── browser-extension     # Chrome extension for recording
├── packages
│   └── data-ops             # Shared library (Zod schemas, Auth, Database, Queries)
└── agents                    # AI/agent workflow documentation
```

### Key Architectural Principles

1. **Zod Bridge:** Data schemas in `@repo/data-ops` are the single source of truth across frontend, backend, and workflows
2. **Shared Authentication:** Better-Auth singleton factory in `packages/data-ops/auth.ts` serves both frontend and backend workers
3. **Edge-Native:** All compute runs on Cloudflare edge with fresh database connections per request (no connection pooling)
4. **Worker Communication:** Frontend worker calls backend via `BACKEND_SERVICE` binding for RPC

### Data Flow

- **tRPC:** Frontend → `apps/user-application/worker/trpc/` → Backend service binding
- **Queues:** Async processing via Cloudflare Queues (recording-ingest)
- **Durable Objects:** Real-time state (GuideSession, LinkClickTracker)
- **Workflows:** Long-running tasks (PDF export, webinar reminders)

## Commands

### Development
```bash
pnpm install                  # Install all dependencies
pnpm build-package            # Build @repo/data-ops (run after schema changes)
pnpm dev-frontend             # Dev server for user-application
pnpm dev-data-service         # Dev server for data-service (uses stage env)
```

### Testing
```bash
pnpm --filter user-application test    # Frontend tests (vitest)
pnpm --filter data-service test        # Backend tests (vitest with Cloudflare pool)
```

### Deployment
```bash
pnpm stage:deploy-frontend       # Deploy frontend to staging
pnpm production:deploy-frontend  # Deploy frontend to production
```

### Database (from packages/data-ops)
```bash
pnpm --filter @repo/data-ops generate      # Generate migration files
pnpm --filter @repo/data-ops push          # Push schema to database
pnpm --filter @repo/data-ops studio        # Open Drizzle Studio
pnpm --filter @repo/data-ops better-auth-generate  # Generate auth schema
```

## Key Directories

### Backend (`apps/data-service/src/`)
- `hono/routes/` - API routes (guides, images, users, exports, auth, webhooks, editor)
- `rpc-methods/` - RPC methods exposed via WorkerEntrypoint
- `queue-handlers/` - Async queue consumers
- `workflows/` - Long-running tasks
- `durable-objects/` - Real-time stateful objects

### Frontend (`apps/user-application/`)
- `src/routes/` - TanStack Router file-based routes
- `src/components/` - UI components (Radix UI primitives)
- `worker/hono/` - BFF Worker routes
- `worker/trpc/` - tRPC router definitions

### Shared (`packages/data-ops/src/`)
- `zod/` - All Zod validation schemas
- `queries/` - Database query functions
- `drizzle-out/` - Auto-generated Drizzle schema (schema.ts, auth-schema.ts, relations.ts)

## Adding Features Workflow

1. Add/update Drizzle schema in `packages/data-ops/src/drizzle-out/`
2. Add Zod validation in `packages/data-ops/src/zod/`
3. Implement queries in `packages/data-ops/src/queries/`
4. Add backend route in `apps/data-service/src/hono/routes/`
5. Add tRPC procedure in `apps/user-application/worker/trpc/`
6. Create frontend route/components in `apps/user-application/src/routes/`
7. Rebuild data-ops: `pnpm build-package`

## Environments

- **Stage:** `stage.stepps.ai` / `api.stage.stepps.ai`
- **Production:** `stepps.ai` / `api.stepps.ai`

## Git Workflow

- **Main branch for PRs:** `stage`
- **Production branch:** `production`
- Deploy to stage first, test, then merge to production

## Package Exports

`@repo/data-ops` exports:
- `./database` - Database initialization
- `./queries` - Query functions
- `./zod-schema` - All Zod validation schemas
- `./durable-objects-helpers` - DO utilities
- `./auth` - Auth factory function
