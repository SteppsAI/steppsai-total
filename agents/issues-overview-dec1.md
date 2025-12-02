# Issues Overview - December 1, 2025

## Summary of Problems

### Issue 1: Delete Function Not Working ❌
**Location**: Editor page (`$guideId.tsx`) → tRPC `images.delete`

**Problem**: 
- When deleting a step, `images.delete` is called but the step is not actually removed from the guide
- The `guides.update` is called but the step remains in the response
- R2 image might be deleted but DB step persists

**Root Cause Analysis**:
- Looking at `$guideId.tsx` line 154-190: `handleDeleteStep` does optimistic update, deletes image, then saves
- BUT: The `saveGuide` function uses `guide.steps` which is the OLD state before the filter!
- Line 176-183: `guide.steps.filter(...)` uses stale `guide` reference

**Fix**: Use the updated steps from the optimistic update, not the old `guide.steps`

---

### Issue 2: Canvas Annotations Not Persisting ❌
**Location**: Canvas annotations → R2 storage

**Problem**:
- When using editor toolbar to add annotations (arrows, circles, text, hide)
- Annotations are saved to DB as JSON overlays
- BUT the actual screenshot image in R2 is NOT modified with the annotations burned in

**Current Flow**:
1. Screenshot captured → saved to R2 as raw image
2. User adds annotations → saved as JSON overlay data in DB
3. When viewing, overlays are rendered on top of image via Konva

**What User Expects**:
- The exported/shared image should have annotations burned in

**Solution Options**:
1. **Server-side rendering**: Use Puppeteer/Playwright to render Konva canvas and screenshot
2. **Client-side export**: When exporting, use Konva's `toDataURL()` to get image with annotations
3. **Keep current**: Overlays stay as data, render dynamically (current behavior)

**Recommendation**: Option 2 is simplest - use Konva's built-in export. Only burn-in when explicitly exporting/sharing.

---

### Issue 3: Click Action Indicator Not Showing in Editor/View ❌
**Location**: `$guideId.tsx` (view) and `canvas.tsx` (editor)

**Problem**:
- Extension captures click coordinates (x%, y%)
- Backend generates arrow overlay pointing to click location
- BUT: The overlay format from backend doesn't match what Canvas expects!

**Backend generates** (in `recording-ingest.ts`):
```json
{
  "type": "arrow",
  "from": [x-50, y+50],
  "to": [x, y]
}
```

**Canvas expects** (in `canvas.tsx`):
```typescript
interface ArrowAnnotation {
  id: string;
  type: 'arrow';
  points: [x1, y1, x2, y2]; // NOT from/to!
  color: string;
  strokeWidth: number;
}
```

**Fix**: 
1. Update `recording-ingest.ts` to generate correct overlay format
2. OR transform overlays when loading in frontend

---

### Issue 4: Data Not Showing After Recording ❌
**Location**: Guide `a6c08265-cbf6-449c-b1a3-6cb09c8d9a9a`

**Problem**:
- Recording completes, data exists in DB
- BUT: `steps` field is double-JSON-encoded: `"\"[{\\\"id\\\"...`
- The steps are a JSON string inside a JSON string!

**Root Cause**:
- In `recording-ingest.ts` or `updateGuideSteps`, the steps array is being stringified twice
- Or the DB column is treating JSONB incorrectly

**Evidence from user's data**:
```
"steps":"\"[{\\\"id\\\":\\\"a287c487...
```
This is `"` followed by escaped JSON - double encoding!

**Fix**: Check `updateGuideSteps` function and ensure it's not double-stringifying

---

## Priority Order

1. **Issue 4** (Data not showing) - Most critical, breaks everything
2. **Issue 1** (Delete not working) - Important for UX
3. **Issue 3** (Click indicator) - Visual improvement
4. **Issue 2** (Annotations persist) - Can defer, current behavior is acceptable

---

## Files to Modify

1. `packages/data-ops/src/queries/guides.ts` - Fix double JSON encoding
2. `apps/user-application/src/routes/app/_authed/editor/$guideId.tsx` - Fix delete logic
3. `apps/data-service/src/queue-handlers/recording-ingest.ts` - Fix overlay format
4. `apps/user-application/src/components/editor/canvas.tsx` - Transform overlays if needed

---

## Fixes Applied

### Issue 4 Fix ✅
**File**: `packages/data-ops/src/queries/guides.ts`
- Removed `JSON.stringify()` from `updateGuide` and `updateGuideSteps`
- JSONB columns accept objects directly, no need to stringify

### Issue 1 Fix ✅
**File**: `apps/user-application/src/routes/app/_authed/editor/$guideId.tsx`
- Fixed stale state reference in `handleDeleteStep`
- Now calculates updated steps BEFORE state changes
- Added proper error handling and optimistic update revert
- Fixed image key extraction from full URL

### Issue 3 Fix ✅
**Files**: 
- `apps/data-service/src/queue-handlers/recording-ingest.ts` - Now generates circle overlay in correct format
- `apps/user-application/src/components/editor/canvas.tsx` - Added `overlayToPixels` conversion
- `apps/user-application/src/types/db.ts` - Added `type`, `x`, `y` fields to Step interface

### Issue 2 (Annotations not persisting to image)
**Status**: Not a bug - working as designed
- Annotations are stored as JSON overlays
- They render dynamically on top of the image
- For export, use Konva's `toDataURL()` to burn in annotations

## Deployment Required

After these changes, you need to:
1. Deploy `data-service` to Cloudflare Workers
2. Deploy `user-application` to Cloudflare Workers
3. Rebuild `data-ops` package if using local linking

```bash
# In packages/data-ops
pnpm build

# In apps/data-service
pnpm deploy:stage

# In apps/user-application  
pnpm deploy:stage
```

