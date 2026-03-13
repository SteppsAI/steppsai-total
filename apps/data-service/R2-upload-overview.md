# R2 uploadonderzoek (data-service + user-application + browser-extension)

## Korte conclusie (direct)
De R2-uploadflow zit in 3 lagen:
1) frontend/extension bouwt een `key` + `dataUrl` en roept een tRPC-call of directe `data-service` endpoint aan,
2) user-application stuurt dat door naar `BACKEND_SERVICE` (Cloudflare Worker RPC naar `data-service`),
3) `data-service` plaatst de bytes via `uploadBase64ToR2` in de gebonden R2-bucket.

## 1) Config / omgeving
### `apps/data-service/wrangler.jsonc`
- `env.stage.r2_buckets` → binding `BUCKET` → bucket `stepps-assets-stage`
- `env.production.r2_buckets` → binding `BUCKET` → bucket `stepps-assets-production`
- `ASSETS_URL`:
  - stage: `https://stepps-assets-stage.stepps.ai`
  - production: `https://assets.stepps.ai`

### `apps/data-service/package.json`
- `dev`: `wrangler dev --env stage`
- `start`: `wrangler dev`
- `stage:deploy`: `wrangler deploy --env stage`
- `production:deploy`: `wrangler deploy --env production`

## 2) Kern-uploadfunctie
### `apps/data-service/src/helpers/base64toR2.ts`
- Functie: `uploadBase64ToR2(bucket, key, dataUrl)`
- Validatie: regex op `^data:([^;]+);base64,(.+)$`
- Decodeert met `atob`, converteert naar `Uint8Array` en `bucket.put(key, bytes.buffer, httpMetadata.contentType)`
- Geeft `key` terug
- Geen expliciete checks op max-size of key-safety (path traversal/allowlist ontbreekt)

## 3) Wie roept wat aan
## 3.1 Backend direct (data-service)

### Hono routes
- `POST /images/upload` (`data-service/src/hono/routes/images.ts`)
  - body: `{ key, dataUrl }`
  - -> `uploadBase64ToR2(c.env.BUCKET, key, dataUrl)`
- `DELETE /images/*` / `POST /images/delete-batch` verwijderen keys in R2
- `GET /images/*` leest uit R2 en retourneert content met HTTP metadata
- `PUT /images/*` accepteert binary (`arrayBuffer`) en doet `BUCKET.put` zonder expliciete `contentType`

### Hono routes voor avatars/cleanup
- `POST /users/upload-avatar` (route + rpc-methode)
- `DELETE /users/avatar` in route handler
- `DELETE /guides/:guideId` en `/guides/steps/:stepId` verwijderen relevante assets

### RPC methods in `data-service`
- `uploadImage`, `uploadAvatar`, `deleteImage`, `deleteImagesBatch`
- `uploadAvatar`:
  - verwijdert oude `profile_pictures/${userId}/`
  - schrijft nieuwe sleutel `profile_pictures/${userId}/${uuid}.webp`
- `deleteGuideWithImages`, `deleteStepWithImage` verwijderen screenshots/brands/assets uit R2 en doen daarna DB actie

### Export workflow
- `guide-pdf-export.ts`:
  - render output eerst naar temp-key `temp-exports/${userId}/${guideId}/${uuid}.(pdf|html|docx)`
  - daarna move naar final `exports/${userId}/${guideId}/${uuid}.(pdf|html|docx)`
  - bij success verwijdert temp-object, updatet guide-exportstatus via `updateGuideExportStatus` met publieke URL
  - publieke URL: `${ASSETS_URL}/${r2Key}`

## 3.2 user-application: end-to-end (belangrijkste paths)

### tRPC-router in `apps/user-application/worker/trpc/router.ts`
- Alles gaat via `/trpc`
- R2/DO/Workflow operaties gebruiken `BACKEND_SERVICE` RPC

### `images` router (`apps/user-application/worker/trpc/routers/images.ts`)
- `upload`: `backend.uploadImage(input.key, input.dataUrl)`
- `delete`, `deleteBatch`, `fetchAsDataUri`
- `fetchAsDataUri` laat alleen URLs door binnen `ASSETS_URL`

### `users` router
- `uploadAvatar` -> `backend.uploadAvatar(userId, dataUrl)`
- `deleteAvatar` -> `backend.deleteAvatar(userId)`

### `guides` router
- `delete` -> `backend.deleteGuideWithImages`
- `deleteStep` -> `backend.deleteStepWithImage`
- `getExportStatus` -> leest alleen `exportedDocs` uit DB

### `guideExports` router
- `triggerExport` -> `backend.triggerExport(guideId, format)`

### Frontend hooks / pages
- `hooks/use-api.ts`:
  - `useUploadImage`, `useDeleteStep`, `useUploadAvatar`
- `editor/$guideId.tsx`:
  - Handmatige add-image: FileReader → dataUrl → `uploadImage` mutation
  - Key voorbeeld: `screenshots/${guideId}/${Date.now()}-${stepId}.${ext}`
  - Na upload: key wordt naar public URL getransformeerd via tRPC-transformatie
  - Importeer stappen: source image -> `fetchAsDataUri` -> her-upload naar `screenshots/${guideId}/imported-...`
  - Brand logo: `brand-logos/${guideId}/...`
- `settings/profile-section.tsx`:
  - Avatar upload: file → dataUrl → `convertToWebP` → `uploadAvatar`
- `export-dialog.tsx` + `stepps/$guideId.tsx`:
  - triggeren export via `guideExports.triggerExport`
  - pollstatus via `guides.getExportStatus`

## 3.3 browser-extension
- `browser-extension/src/background/handlers/step-actions.ts`
  - maakt screenshot (png) en converteert naar webp via `convertToWebP`
  - key: `screenshots/${guideId}/${userId}/${stepId}.webp`
  - upload via `trpc.images.upload` (dus via user app tRPC → BACKEND_SERVICE)
- `sidepanel/SidePanelApp.tsx`:
  - toont preview uit `step.previewUrl` of direct `API_BASE_URL/images/${step.imageKey}`
- `API_BASE_URL` uit `browser-extension/src/lib/config.ts`: standaard `https://api.stage.stepps.ai` (stage fallback)

## 4) URL-transform & keys
### `apps/user-application/worker/trpc/helpers/transform-assets.ts`
- `prependAssetsUrl(key, assetsUrl)`:
  - alleen als key geen full URL is
  - bouwt `${ASSETS_URL}/${key}`
- `transformGuideWithUrls` voegt `ASSETS_URL` toe aan `brandImageKey` en alle `steps[].imageKey`

### DB schema (`packages/data-ops/src/drizzle-out/schema.ts`)
- `guides.exportedDocs` houdt status/URL per type bij (`pdf/html/docx`) 
- `users.avatar_url`, `guides.brand_image_key`, `steps[].imageKey` zijn keys die later als URL gepresenteerd worden

### Export status flow
- `updateGuideExportStatus(guideId, type, status, url?)` in `packages/data-ops/src/queries/guides.ts`
  - atomic JSONB merge in DB
- UI pollt `getGuideExportStatus` en toont final URL uit `guide.exportedDocs`

## 5) Testing vs productie
- In data-service zelf zijn geen unit/integrationtests voor upload of workflow gevonden
- `data-service/test` bevat alleen config (`tsconfig`, `env.d.ts`)
- Debug endpoints bestaan:
  - `POST /exports/pdf` en `/exports/html` genereren direct terug zonder naar R2 te schrijven
- In tRPC/routers is vooral afhankelijk van runtime paden (`BACKEND_SERVICE`, `ASSETS_URL`), niet mocks in tests

## 6) Wat is “frontend-proof” in de praktijk (samengevat)
- De echte uploads in productie verlopen via de tRPC->BACKEND_SERVICE keten, behalve:
  - directe `PUT /images/*` route in data-service (niet standaard gebruikt door app/extension)
- Productie/stage scheiding zit in wrangler en URL-fallbacks (data-service, user-app worker, extension env vars)

## 7) Risico’s / harde opmerkingen
1) `uploadBase64ToR2` accepteert key/dataUrl zonder sanitatie
2) Geen expliciete max-size limiet
3) `PUT /images/*` mist content-type metadata
4) Upload route met `dataUrl` accepteert alles wat regex passeert (geen whitelist content-type)
5) `start`-script in data-service gebruikt `wrangler dev --env stage` (consistent met stage), `production`-deploy is expliciet

## 8) Duidelijk plan (quick execution)
1. **Bevestigen van volledige paden**
   - Bevestig dat `data-service` + `user-app` + `extension` in jullie target-env (stage/prod) de juiste env vars gebruiken.
2. **Audit testscenario’s opzetten**
   - Voor `uploadBase64ToR2`, `data-service/src/hono/routes/images.ts`, `worker/workflow guide-pdf-export` happy + failure paths.
3. **Hardening checklist uitvoeren**
   - size-limiet,
   - key-normalisatie,
   - allowlist op MIME,
   - e2e-check dat alleen verwachte key-prefixen geaccepteerd worden.
4. **Observability aanscherpen**
   - logen met request-id / key / userId bij upload, delete, export-move.
5. **UI-feedback verbeteren**
   - betere foutmelding wanneer upload faalt (front), status reflectie voor export via polling timeout + retry.
6. **Run-through stage met echte recordings**
   - capture + import + edit + export (pdf/html/docx) + delete.

## 9) Tekst die je meteen kunt gebruiken
“R2 staat op 2 plekken centraal: data-service (de echte opslag met `BUCKET`) en de user-app/extension (die alleen keys/dataUrl verzendt via tRPC). Stage/prod wisselen alleen van bucket en `ASSETS_URL`; de payload- en uploadflow is in code gelijk. In de praktijk wordt `data-service` alleen direct aangesproken voor `/images/*` serving en upload-route, terwijl de “main” app-pad via `BACKEND_SERVICE` in de worker loopt naar dezelfde helper `uploadBase64ToR2`.”
