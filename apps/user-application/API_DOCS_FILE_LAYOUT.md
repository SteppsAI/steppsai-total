# API docs file layout

Dit bestand zet kort en strak uiteen welke files relevant zijn voor de nieuwe publieke API docs onder `/docs`.

## Nieuwe files voor de publieke `/docs` pagina

### Route entry
- [src/routes/docs.tsx](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/docs.tsx)
  - Nieuwe publieke route `/docs`
  - Rendert de API docs pagina

### Hoofdcomponent van de API docs
- [src/components/api-docs/api-docs-page.tsx](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/api-docs/api-docs-page.tsx)
  - Hele layout van de publieke API docs
  - Hero
  - Sidebar navigatie
  - Endpoint cards
  - Code voorbeelden
  - Sticky rechter rail
  - Gebruikt Stepps navbar/footer

### Hand-authored content/source of truth voor de docs page
- [src/lib/agent-api-docs.ts](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/lib/agent-api-docs.ts)
  - Definieert alle endpoint docs/content voor `/docs`
  - Sections
  - Endpoint metadata
  - Request body velden
  - Response examples
  - Quickstart prompt

## Bestaande files die door de `/docs` pagina gebruikt worden

### Website shell
- [src/components/home-page/Navbar.tsx](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/home-page/Navbar.tsx)
  - Bovenste publieke site navigatie

- [src/components/home-page/footer.tsx](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/home-page/footer.tsx)
  - Onderste publieke site footer

### Utility
- [src/lib/utils.ts](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/lib/utils.ts)
  - `cn(...)` utility voor class merging in de layout

## Files die inhoudelijk de endpoint truth leveren

Deze files renderen de `/docs` pagina niet direct, maar zijn wel de backend waarheid waar de docs inhoud op gebaseerd hoort te zijn.

### Public REST agent API
- [worker/hono/routes/agent-api.ts](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/hono/routes/agent-api.ts)
  - Publieke `REST v1` agent routes
  - Dit is de primaire file om endpoint paths te verifiëren

### Backend behavior
- [../data-service/src/rpc-methods/agent-api.ts](/Users/wernerjohannesdieben/steppsai-total/apps/data-service/src/rpc-methods/agent-api.ts)
  - Gedrag achter create/list/revoke keys
  - Browser sessions
  - Runs
  - Artifacts/completion behavior

### Shared schemas/types
- [../packages/data-ops/src/zod/agent-api.ts](/Users/wernerjohannesdieben/steppsai-total/packages/data-ops/src/zod/agent-api.ts)
  - Statuses
  - Failure codes
  - Run/runtime/output shapes

## Files die ik expliciet niet heb aangepast voor deze `/docs` pagina

Deze bestaande generated docs flow is expres ongemoeid gelaten:

- [src/routes/app/_authed/editor/$guideId.tsx](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/app/_authed/editor/$guideId.tsx)
- [src/routes/app/_authed/docs/$guideId.tsx](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/app/_authed/docs/$guideId.tsx)
- [src/components/docs/docs-editor.tsx](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/docs/docs-editor.tsx)
- [src/components/docs/public-docs-page.tsx](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/docs/public-docs-page.tsx)
- [src/routes/shared/docs/$guideId.tsx](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/shared/docs/$guideId.tsx)

## Kort overzicht van de flow

### Frontend
- `/docs`
  - [src/routes/docs.tsx](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/routes/docs.tsx)
  - [src/components/api-docs/api-docs-page.tsx](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/components/api-docs/api-docs-page.tsx)
  - [src/lib/agent-api-docs.ts](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/src/lib/agent-api-docs.ts)

### Public API source
- [worker/hono/routes/agent-api.ts](/Users/wernerjohannesdieben/steppsai-total/apps/user-application/worker/hono/routes/agent-api.ts)

### Backend implementation
- [../data-service/src/rpc-methods/agent-api.ts](/Users/wernerjohannesdieben/steppsai-total/apps/data-service/src/rpc-methods/agent-api.ts)
- [../packages/data-ops/src/zod/agent-api.ts](/Users/wernerjohannesdieben/steppsai-total/packages/data-ops/src/zod/agent-api.ts)
