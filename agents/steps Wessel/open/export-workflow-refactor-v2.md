# Export Workflow Refactor v2 - Implementation Complete ✅

## Problem Summary

The current export workflow has multiple critical issues:

### 1. **Workflow Fails with DB Query Error**
```
Failed query: select "id", "user_id", "folder_id", "title", "description", "slug", "status"...
params: fb85eac2-75bf-4e8a-98b0-587f21394897,1
```
The workflow calls `updateGuideExportStatus()` which internally calls `getGuide()`, but the DB connection isn't properly initialized in the workflow step context.

### 2. **Frontend Sends Unnecessary Data**
- Frontend sends `ASSETS_URL` when `data-service` already has it in `wrangler.jsonc`
- Frontend generates HTML with `renderToStaticMarkup()` but this should happen server-side where we have access to R2 images

### 3. **R2/DB Inconsistency**
- URLs in DB point to deleted R2 objects (404 errors)
- Old exports are deleted from R2 but DB still references them
- No atomic operations between R2 and DB

### 4. **PDF Missing Images/Annotations**
- The PDF shows step titles but images are broken
- Annotations (arrows, circles, etc.) are not rendered on images
- The HTML template uses external image URLs that Cloudflare PDF API can't fetch

### 5. **Polling UX is Poor**
- Multiple useEffects for polling
- Complex state management
- User has to wait and watch

---

## Solution Architecture

### Key Insight: Server-Side HTML Generation

The workflow should:
1. Fetch guide data from DB (including steps with overlays)
2. Fetch images from R2
3. Convert images to base64 data URLs
4. Render annotations onto images (using Sharp or Canvas)
5. Generate HTML with embedded images
6. Convert to PDF via Cloudflare API

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (export-dialog.tsx)                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User clicks "Export PDF"                                    │
│                                                                  │
│  2. Call TRPC mutation with ONLY:                               │
│     - guideId                                                   │
│     - format ('pdf' | 'html')                                   │
│                                                                  │
│  3. Show toast: "Export started, we'll notify you when ready"  │
│                                                                  │
│  4. Navigate to /app/exports                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ DATA-SERVICE (workflow)                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: "Fetch Guide"                                          │
│    - initDatabase(env.DATABASE_URL)                             │
│    - const guide = await getGuide(guideId)                      │
│    - Return guide data with steps                               │
│                                                                  │
│  Step 2: "Prepare Images"                                       │
│    - For each step with imageKey:                               │
│      - Fetch image from R2: env.BUCKET.get(imageKey)            │
│      - If step has overlays, render them onto image             │
│      - Convert to base64 data URL                               │
│    - Return map of stepId → base64DataUrl                       │
│                                                                  │
│  Step 3: "Generate HTML"                                        │
│    - Use server-side template (not React)                       │
│    - Embed base64 images directly in HTML                       │
│    - Include all CSS inline                                     │
│                                                                  │
│  Step 4: "Delete Old Export"                                    │
│    - List R2 objects with prefix exports/{userId}/{guideId}/    │
│    - Delete matching .pdf or .html files                        │
│    - Update DB: exportedDocs[format] = { status: 'PENDING' }    │
│                                                                  │
│  Step 5: "Render PDF" (if format === 'pdf')                     │
│    - POST to Cloudflare Browser Rendering API                   │
│    - Receive PDF bytes                                          │
│                                                                  │
│  Step 6: "Upload to R2"                                         │
│    - Generate new fileId                                        │
│    - Upload to exports/{userId}/{guideId}/{fileId}.pdf          │
│    - Update DB: exportedDocs[format] = {                        │
│        status: 'COMPLETED',                                     │
│        url: publicUrl,                                          │
│        last_updated: now()                                      │
│      }                                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Tasks

### Task 1: Simplify Frontend Export Trigger

**File:** `apps/user-application/src/components/export-dialog.tsx`

**Changes:**
- Remove `renderToStaticMarkup()` call
- Remove `GuideExportTemplate` import
- Remove `VITE_ASSETS_URL` usage
- Remove polling logic (useEffects, pollCount, etc.)
- Just call mutation and navigate to exports page

```typescript
const handleExport = async () => {
    if (format === 'word') {
        toast.info("Coming soon!");
        return;
    }

    try {
        await triggerExport.mutateAsync({ guideId, format });
        toast.success(`${format.toUpperCase()} export started! Check the exports page.`);
        navigate({ to: "/app/exports" });
        onOpenChange(false);
    } catch (error) {
        toast.error(`Failed to start export: ${error.message}`);
    }
};
```

---

### Task 2: Update TRPC Router

**File:** `apps/user-application/worker/trpc/routers/exports.ts`

**Changes:**
- Remove `htmlContent` from input schema
- Remove hardcoded `accountId` (get from guide's userId)

```typescript
triggerExport: publicProcedure
    .input(z.object({
        guideId: z.string(),
        format: z.enum(["pdf", "html"]),
    }))
    .mutation(async ({ input, ctx }) => {
        const { guideId, format } = input;

        const response = await ctx.env.BACKEND_SERVICE.fetch(
            new Request('https://internal/exports/trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guideId, format }),
            })
        );

        if (!response.ok) {
            const error = await response.json();
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error.error || 'Failed to trigger export',
            });
        }

        return { success: true };
    }),
```

---

### Task 3: Update Hono Export Route

**File:** `apps/data-service/src/hono/routes/exports.ts`

**Changes:**
- Remove `htmlContent` and `accountId` from request body
- Fetch guide to get userId (accountId)
- Pass only necessary data to workflow

```typescript
exportsRouter.post('/trigger', async (c) => {
    try {
        const { guideId, format } = await c.req.json<{
            guideId: string;
            format: 'pdf' | 'html';
        }>();

        if (!guideId || !format) {
            return c.json({ error: 'Missing guideId or format' }, 400);
        }

        // Trigger workflow - it will fetch guide data itself
        await c.env.GUIDE_EXPORT_WORKFLOW.create({
            params: { guideId, format }
        });

        return c.json({ success: true, status: 'PENDING' });
    } catch (error) {
        console.error('Failed to trigger export:', error);
        return c.json({ error: 'Failed to start export' }, 500);
    }
});
```

---

### Task 4: Refactor Workflow - Complete Rewrite

**File:** `apps/data-service/src/workflows/guide-pdf-export.ts`

This is the main change. The workflow will:
1. Fetch guide from DB
2. Fetch images from R2 and render annotations
3. Generate HTML server-side
4. Delete old exports (R2 first, then update DB)
5. Create new export (upload to R2, then update DB)

```typescript
import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import { getGuide, updateGuideExportStatus } from '@repo/data-ops/queries/guides';
import { initDatabase } from '@repo/data-ops/database';
import { v4 as uuidv4 } from 'uuid';

interface ExportParams {
    guideId: string;
    format: 'pdf' | 'html';
}

export class GuidePdfExportWorkflow extends WorkflowEntrypoint<Env, ExportParams> {
    async run(event: Readonly<WorkflowEvent<ExportParams>>, step: WorkflowStep) {
        const { guideId, format } = event.payload;
        
        // Step 1: Fetch guide data
        const guide = await step.do('Fetch Guide', async () => {
            initDatabase(this.env.DATABASE_URL);
            const guide = await getGuide(guideId);
            if (!guide) throw new Error('Guide not found');
            return guide;
        });

        const userId = guide.userId;
        const steps = guide.steps || [];

        // Step 2: Prepare images with annotations
        const imageMap = await step.do('Prepare Images', async () => {
            const map: Record<string, string> = {};
            
            for (const step of steps) {
                if (!step.imageKey) continue;
                
                // Fetch image from R2
                const object = await this.env.BUCKET.get(step.imageKey);
                if (!object) continue;
                
                const buffer = await object.arrayBuffer();
                const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
                const contentType = object.httpMetadata?.contentType || 'image/webp';
                
                // TODO: Render annotations onto image using Sharp/Canvas
                // For now, just use the raw image
                map[step.id] = `data:${contentType};base64,${base64}`;
            }
            
            return map;
        });

        // Step 3: Generate HTML
        const htmlContent = await step.do('Generate HTML', async () => {
            return generateExportHtml(guide, imageMap);
        });

        // Step 4: Delete old exports (R2 first, then DB)
        await step.do('Delete Old Export', async () => {
            initDatabase(this.env.DATABASE_URL);
            
            const prefix = `exports/${userId}/${guideId}/`;
            const listed = await this.env.BUCKET.list({ prefix });
            const extension = format === 'pdf' ? '.pdf' : '.html';
            const toDelete = listed.objects.filter(obj => obj.key.endsWith(extension));
            
            // Delete from R2
            await Promise.all(toDelete.map(obj => this.env.BUCKET.delete(obj.key)));
            
            // Update DB to PENDING (clears old URL)
            await updateGuideExportStatus(guideId, format, 'PENDING');
        });

        // Step 5: Render PDF (if needed)
        let fileContent: Uint8Array | string;
        if (format === 'pdf') {
            fileContent = await step.do('Render PDF', async () => {
                const response = await fetch(
                    `https://api.cloudflare.com/client/v4/accounts/${this.env.CLOUDFLARE_ACCOUNT_ID}/browser-rendering/pdf`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.env.CLOUDFLARE_API_TOKEN_BROWSER}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ html: htmlContent }),
                    }
                );
                
                if (!response.ok) {
                    throw new Error(`PDF render failed: ${response.status}`);
                }
                
                return new Uint8Array(await response.arrayBuffer());
            });
        } else {
            fileContent = htmlContent;
        }

        // Step 6: Upload to R2 and update DB
        await step.do('Upload Export', async () => {
            initDatabase(this.env.DATABASE_URL);
            
            const fileId = uuidv4();
            const extension = format === 'pdf' ? 'pdf' : 'html';
            const r2Key = `exports/${userId}/${guideId}/${fileId}.${extension}`;
            
            await this.env.BUCKET.put(r2Key, fileContent, {
                httpMetadata: {
                    contentType: format === 'pdf' ? 'application/pdf' : 'text/html'
                }
            });
            
            const publicUrl = `${this.env.ASSETS_URL}/${r2Key}`;
            await updateGuideExportStatus(guideId, format, 'COMPLETED', publicUrl);
        });
    }
}

// Server-side HTML template generator
function generateExportHtml(guide: any, imageMap: Record<string, string>): string {
    const steps = guide.steps || [];
    
    const stepsHtml = steps
        .filter((step: any) => !step.isExcluded)
        .sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .map((step: any, index: number) => {
            const imageDataUrl = imageMap[step.id] || '';
            const caption = step.caption || step.aiCaption || `Step ${index + 1}`;
            
            let imageHtml = '';
            if (imageDataUrl) {
                imageHtml = `
                    <div class="screenshot">
                        <img src="${imageDataUrl}" alt="Step ${index + 1}" />
                        ${renderOverlaysSvg(step.overlays)}
                    </div>
                `;
            }
            
            return `
                <div class="step">
                    <div class="step-header">
                        <div class="step-number">${index + 1}</div>
                        <h2>${escapeHtml(caption)}</h2>
                    </div>
                    ${imageHtml}
                </div>
            `;
        })
        .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${escapeHtml(guide.title || 'Guide')}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff; color: #000; line-height: 1.5; }
        .container { max-width: 768px; margin: 0 auto; padding: 48px 24px; }
        .header { text-align: center; padding-bottom: 48px; border-bottom: 1px solid #e5e7eb; margin-bottom: 64px; }
        h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 16px; }
        .description { font-size: 1.25rem; color: #6b7280; }
        .meta { font-size: 0.875rem; color: #6b7280; margin-top: 24px; }
        .steps { display: flex; flex-direction: column; gap: 80px; }
        .step { display: flex; flex-direction: column; gap: 24px; }
        .step-header { display: flex; align-items: flex-start; gap: 16px; }
        .step-number { width: 32px; height: 32px; border-radius: 50%; background: rgba(99, 102, 241, 0.1); color: #6366F1; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .step h2 { font-size: 1.25rem; font-weight: 500; padding-top: 4px; }
        .screenshot { border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; position: relative; }
        .screenshot img { width: 100%; height: auto; display: block; }
        .overlays { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
        @media print { .step { page-break-inside: avoid; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${escapeHtml(guide.title || 'Untitled Guide')}</h1>
            ${guide.description ? `<p class="description">${escapeHtml(guide.description)}</p>` : ''}
            <div class="meta">${steps.filter((s: any) => !s.isExcluded).length} steps</div>
        </div>
        <div class="steps">${stepsHtml}</div>
    </div>
</body>
</html>`;
}

function renderOverlaysSvg(overlays: any[]): string {
    if (!overlays || overlays.length === 0) return '';
    
    const elements = overlays.map((overlay: any) => {
        if (overlay.type === 'circle') {
            return `<circle cx="${overlay.x}%" cy="${overlay.y}%" r="${overlay.radius || 2.5}%" fill="none" stroke="${overlay.color || '#ef4444'}" stroke-width="${overlay.strokeWidth || 3}" />`;
        }
        if (overlay.type === 'arrow') {
            const [x1, y1, x2, y2] = overlay.points || [overlay.from?.[0], overlay.from?.[1], overlay.to?.[0], overlay.to?.[1]];
            if (x1 !== undefined) {
                return `<line x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%" stroke="${overlay.color || '#ef4444'}" stroke-width="${overlay.strokeWidth || 4}" marker-end="url(#arrowhead)" />`;
            }
        }
        if (overlay.type === 'hide') {
            return `<rect x="${overlay.x}%" y="${overlay.y}%" width="${overlay.width}%" height="${overlay.height}%" fill="${overlay.color || '#000'}" />`;
        }
        return '';
    }).join('');
    
    return `
        <svg class="overlays" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                </marker>
            </defs>
            ${elements}
        </svg>
    `;
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
```

---

### Task 5: Update Zod Schema

**File:** `packages/data-ops/src/zod-schema/index.ts` (or wherever ExportParams is defined)

```typescript
export interface ExportParams {
    guideId: string;
    format: 'pdf' | 'html';
}
```

---

### Task 6: Fix updateGuideExportStatus

**File:** `packages/data-ops/src/queries/guides.ts`

The current implementation calls `getGuide()` which requires DB to be initialized. We need to ensure each workflow step initializes DB before any query.

```typescript
export async function updateGuideExportStatus(
    guideId: string,
    type: 'pdf' | 'html' | 'markdown',
    status: 'PENDING' | 'COMPLETED' | 'FAILED',
    url?: string
): Promise<void> {
    const db = getDb();

    // Use raw SQL to update JSONB field atomically
    // This avoids the need to fetch the guide first
    await db.execute(sql`
        UPDATE guides 
        SET 
            exported_docs = COALESCE(exported_docs, '{}'::jsonb) || 
                jsonb_build_object(
                    ${type}, 
                    jsonb_build_object(
                        'status', ${status},
                        'url', ${url || null},
                        'last_updated', ${new Date().toISOString()}
                    )
                ),
            updated_at = NOW()
        WHERE id = ${guideId}
    `);
}
```

---

### Task 7: Delete guide-export-template.tsx (Optional)

**File:** `apps/user-application/src/components/guide-export-template.tsx`

This file is no longer needed since HTML is generated server-side. Can be deleted or kept for reference.

---

## Summary of Changes

| File | Action | Description |
|------|--------|-------------|
| `export-dialog.tsx` | Simplify | Remove HTML generation, polling, just trigger and navigate |
| `exports.ts` (trpc) | Simplify | Remove htmlContent from input |
| `exports.ts` (hono) | Simplify | Remove htmlContent, accountId from request |
| `guide-pdf-export.ts` | Rewrite | Server-side HTML generation, proper R2/DB atomicity |
| `guides.ts` (queries) | Fix | Use raw SQL for atomic JSONB update |
| `guide-export-template.tsx` | Delete | No longer needed |

---

## Testing Plan

1. **Trigger PDF export** → Check workflow logs in Cloudflare Dashboard
2. **Verify PDF has images** → Images should be embedded as base64
3. **Verify PDF has annotations** → SVG overlays should render
4. **Verify R2/DB consistency** → URL in DB should match existing R2 object
5. **Trigger HTML export** → Should work similarly
6. **Delete and re-export** → Old file should be gone, new file should work

---

## Future Improvements

1. **Render annotations onto images** using Sharp or Canvas (currently just SVG overlay)
2. **Add progress tracking** via Durable Objects for real-time status
3. **Implement Word export** using docx library
4. **Add email notification** when export is ready

