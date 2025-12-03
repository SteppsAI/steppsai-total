# Export Implementation Changes

## Wat er veranderd is

### 1. **Architectuur Pattern**
Volgde niet het bestaande patroon. Nu gefixed:

**Voor:**
```
Frontend TRPC → RPC Service Binding → Backend
```

**Nu:**
```
Frontend TRPC → HTTP fetch() → Hono Route → Backend
```

### 2. **Nieuwe Files**

#### `apps/data-service/src/hono/routes/exports.ts`
Hono router met 3 endpoints:
- `POST /exports/trigger` - Triggert async workflow (PDF/HTML via R2)
- `POST /exports/pdf` - Direct PDF export (synchronous, voor testing)
- `POST /exports/html` - Direct HTML export (synchronous, voor testing)

#### `apps/user-application/src/components/guide-export-template.tsx`
Print-geoptimaliseerde React component met vanilla CSS.

### 3. **Aangepaste Files**

#### Frontend
- **export-dialog.tsx**: Gebruikt `renderToStaticMarkup()`, HTML format enabled, loading states
- **exports.ts (TRPC)**: Maakt HTTP call naar `https://internal/exports/trigger`
- **service-bindings.d.ts**: Simplified (geen RPC interface meer)

#### Backend
- **browser-render.ts**: Puppeteer → Cloudflare REST API
- **guide-pdf-export.ts**: Accepts htmlContent, supports PDF & HTML
- **app.ts**: Exports router toegevoegd
- **index.ts**: RPC method verwijderd
- **wrangler.jsonc**: Browser binding verwijderd, CLOUDFLARE_ACCOUNT_ID verwijderd
- **service-bindings.d.ts**: CLOUDFLARE_ACCOUNT_ID & CLOUDFLARE_API_TOKEN toegevoegd
- **guides.ts**: Export type uitgebreid met 'html'

## Configuratie

### Environment Variables (via Cloudflare Dashboard)
- `CLOUDFLARE_ACCOUNT_ID` - Je account ID
- `CLOUDFLARE_API_TOKEN` - API token met Browser Rendering permissies

> **Let op**: Deze worden NIET in `wrangler.jsonc` gezet, maar via de Cloudflare Dashboard onder Settings → Environment Variables

### Wrangler Secrets
```bash
cd apps/data-service
wrangler secret put CLOUDFLARE_API_TOKEN --env stage
wrangler secret put CLOUDFLARE_API_TOKEN --env production
```

## Flow

```
1. User klikt "Export PDF/HTML"
2. Frontend haalt guide data op
3. Frontend rendert React component → HTML string (renderToStaticMarkup)
4. Frontend → TRPC.exports.triggerExport({ htmlContent, format })
5. TRPC → fetch('https://internal/exports/trigger', { body: { htmlContent, format } })
6. Hono route → env.GUIDE_EXPORT_WORKFLOW.create({ htmlContent, format })
7. Workflow → Cloudflare REST API (PDF) of direct R2 upload (HTML)
8. R2 upload → Database update met public URL
9. Frontend pollt status → Download trigger
```

## Testing

**Via UI:**
1. Open guide met images + overlays
2. Klik Export → Kies PDF of HTML
3. Verifieer loading state
4. Download en check resultaat

**Direct (voor debugging):**
```bash
# PDF
curl -X POST http://localhost:8787/exports/pdf \
  -H "Content-Type: application/json" \
  -d '{"htmlContent":"<html><body>Test</body></html>"}' \
  --output test.pdf

# HTML
curl -X POST http://localhost:8787/exports/html \
  -H "Content-Type: application/json" \
  -d '{"htmlContent":"<html><body>Test</body></html>"}' \
  --output test.html
```

## Key Changes van Laatste Fix

1. ✅ **ASSETS_URL fallback**: `this.env.ASSETS_URL ?? 'https://stepps-assets-stage.stepps.ai'` (stage als default)
2. ✅ **CLOUDFLARE_ACCOUNT_ID**: Verwijderd uit wrangler.jsonc (via Cloudflare Dashboard)
3. ✅ **TypeScript types**: Export type 'html' toegevoegd aan guides.ts
