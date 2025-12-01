# Issues Fix Plan - November 30, 2025

## Overview

This document outlines the fixes for 5 critical issues affecting the user experience.

---

## Issue 1: Editor Images Not Visible

### Problem

Images are not loading in the editor canvas. Users cannot see screenshots to edit.

### Root Cause

**URL Path Mismatch**: The `transform-assets.ts` helper constructs URLs incorrectly.

- **Extension uses**: `${DATA_SERVICE_URL}/images/${imageKey}` → `https://data-service.../images/screenshots/guideId/userId/stepId.webp`
- **User App uses**: `${ASSETS_URL}/${imageKey}` → `https://stepps-assets.../screenshots/guideId/userId/stepId.webp`

The user application is **missing `/images/`** in the URL path!

### Files to Modify

| File | Action |
|------|--------|
| `apps/user-application/worker/trpc/helpers/transform-assets.ts` | Fix URL construction to include `/images/` prefix |

### Implementation

```typescript
// transform-assets.ts - BEFORE
return `${assetsUrl}/${key}`;

// transform-assets.ts - AFTER  
return `${assetsUrl}/images/${key}`;
```

### Verification

1. Open any guide in the editor
2. Images should load in the canvas
3. Images should load in step sidebar thumbnails

---

## Issue 2: R2 Images Not Deleted When Guide Deleted (CRITICAL)

### Problem

When a user deletes a guide via the dashboard/stepps page:
- ✅ Database row is deleted
- ❌ R2 images remain (zombie data)

This will cause storage costs to grow indefinitely.

### Root Cause

The user-application's `guides.delete` tRPC mutation only calls `deleteGuide()` from `data-ops`, which only deletes from the database. There's no call to delete R2 images.

R2 deletion only happens in:
- `data-service/src/hono/routes/guides.ts` DELETE endpoint (for discarding recordings from extension)
- `recording-ingest.ts` cleanup on failure

### Solution Strategy

**Option A (Recommended)**: Call data-service from user-application to handle R2 deletion
- Uses existing BACKEND_SERVICE binding
- Keeps R2 logic centralized in data-service
- Atomic operation: R2 first, then DB

**Option B**: Add R2 bucket binding to user-application
- Requires wrangler config changes
- Duplicates deletion logic

### Files to Modify

| File | Action |
|------|--------|
| `apps/user-application/worker/trpc/routers/guides.ts` | Call data-service for guide deletion |
| `apps/data-service/src/hono/routes/guides.ts` | Already has DELETE endpoint (verify it works) |

### Implementation

```typescript
// guides.ts (user-application/worker/trpc/routers)
delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
        // Call data-service to delete guide (handles R2 + DB deletion)
        const response = await ctx.env.BACKEND_SERVICE.fetch(
            new Request(`https://internal/guides/${input.id}`, {
                method: 'DELETE',
            })
        );
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete guide');
        }
        
        return { success: true };
    }),
```

### Deletion Order (data-service)

```
1. Get guide from DB (to get steps with imageKeys)
2. Delete all images from R2 using imageKeys
3. Delete guide from DB
4. If DB delete fails → Log warning (images already gone, but guide remains)
5. If R2 delete fails → Return error (don't delete from DB)
```

### Fallback Strategy

If R2 deletion fails but DB deletion succeeds (should not happen with proper order):
- Log error with guide ID and image keys
- Return error to frontend
- Consider a cleanup job for orphaned R2 objects

### Verification

1. Create a test guide with steps
2. Note the image keys in the database
3. Delete the guide
4. Check R2 bucket - images should be gone
5. Check database - guide row should be gone

---

## Issue 3: Extension → Editor Data Not Loaded

### Problem

After finishing a recording in the browser extension and navigating to the editor:
1. Data is not visible (requires force reload)
2. Sometimes redirects to `/app` page unexpectedly

### Root Causes

1. **Queue Processing Timing**: Steps are processed asynchronously via Cloudflare Queue. When user navigates to editor, processing may not be complete.

2. **Mobile Redirect**: The editor has a `useEffect` that redirects mobile users to `/app`:
```typescript
useEffect(() => {
    if (isMobile) {
        toast.error("Editing is only available on desktop devices.");
        navigate({ to: "/app" });
    }
}, [isMobile, navigate]);
```

3. **Query Cache**: The extension opens a new tab, but TanStack Query in that tab doesn't know data exists.

### Solution

1. **Remove mobile redirect** (per user request)
2. **Improve data loading flow**:
   - Extension already sets status to 'processing' during queue
   - Queue handler sets status to 'draft' when complete
   - Editor can poll/wait for status change

### Files to Modify

| File | Action |
|------|--------|
| `apps/user-application/src/routes/app/_authed/editor/$guideId.tsx` | Remove mobile redirect useEffect |
| `apps/browser-extension/src/sidepanel/SidePanelApp.tsx` | Remove auto-redirect timer |

### Implementation

**Editor $guideId.tsx** - Remove this entire block:
```typescript
// REMOVE THIS:
useEffect(() => {
    if (isMobile) {
        toast.error("Editing is only available on desktop devices.");
        navigate({ to: "/app" });
    }
}, [isMobile, navigate]);
```

**SidePanelApp.tsx** - Remove auto-redirect:
```typescript
// REMOVE THIS ENTIRE useEffect:
useEffect(() => {
    if (recordingState === 'finished' && guideId) {
        const timer = setTimeout(() => {
            chrome.tabs.create({ url: `${WEB_APP_URL}/app/editor/${guideId}` });
            window.close();
            // ...
        }, 3000);
        return () => clearTimeout(timer);
    }
}, [recordingState, guideId]);
```

Keep the "Open Editor" button - user clicks manually when ready.

### Optional Enhancement: Wait for Processing

Add a loading state in the editor when guide status is 'processing':

```typescript
if (guide?.status === 'processing') {
    return (
        <div className="h-screen flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>Processing your recording...</p>
                <p className="text-sm text-muted-foreground">This usually takes a few seconds</p>
            </div>
        </div>
    );
}
```

With `refetchInterval` to poll:
```typescript
const { data: fetchedGuide, isLoading } = useQuery({
    ...trpc.guides.getById.queryOptions({ id: guideId }),
    refetchInterval: (data) => data?.status === 'processing' ? 1000 : false,
});
```

### Verification

1. Make a recording with extension
2. Click "End Recording"
3. Should stay on "Finished" screen
4. Click "Open Editor Now"
5. Editor should load with data (may show processing state briefly)
6. Resize window to mobile size - should NOT redirect

---

## Issue 4: Query Not Invalidated After Move Stepp

### Problem

When moving a stepp to a folder via `MoveSteppDialog`:
- ✅ Database is updated correctly (folderId on guide)
- ❌ UI doesn't update - folder still shows old guide count

### Root Cause

The `confirmMoveStepp` function only invalidates `guides.getAll`, not `folders.getAll`.

Since `getUserFolders()` calculates `guideCount` via SQL subquery, the folder data is stale.

### Files to Modify

| File | Action |
|------|--------|
| `apps/user-application/src/routes/app/_authed/index.tsx` | Add folders invalidation to updateGuideMutation |
| `apps/user-application/src/routes/app/_authed/stepps/index.tsx` | Add folders invalidation to updateGuideMutation |

### Implementation

Both files need the same fix:

```typescript
// BEFORE
const updateGuideMutation = useMutation({
    ...trpc.guides.update.mutationOptions(),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryOptions().queryKey });
    },
});

// AFTER
const updateGuideMutation = useMutation({
    ...trpc.guides.update.mutationOptions(),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryOptions().queryKey });
        queryClient.invalidateQueries({ queryKey: trpc.folders.getAll.queryOptions().queryKey });
    },
});
```

### Verification

1. Create a folder (e.g., "New Folder" with 0 guides)
2. Move a stepp to that folder
3. Folder card should immediately show "1 guide"
4. Move stepp to "No Folder (Root)"
5. Folder card should immediately show "0 guides"

---

## Issue 5: (Covered in Issue 2)

The original Issue 5 about folder move was captured in Issue 4.

---

## Implementation Order

**Priority order based on severity:**

1. **Issue 2: R2 Deletion** - CRITICAL - Prevents zombie data accumulation
2. **Issue 1: Editor Images** - HIGH - Core functionality broken
3. **Issue 4: Query Invalidation** - MEDIUM - UX issue, data is correct
4. **Issue 3: Extension Flow** - MEDIUM - Workaround exists (refresh)

---

## Summary of Changes

| File | Changes |
|------|---------|
| `transform-assets.ts` | Add `/images/` to URL path |
| `guides.ts` (user-app/worker/trpc/routers) | Call data-service for deletion |
| `guides.ts` (data-service/hono/routes) | Ensure R2→DB deletion order |
| `$guideId.tsx` (editor) | Remove mobile redirect |
| `SidePanelApp.tsx` | Remove auto-redirect timer |
| `index.tsx` (_authed) | Add folders invalidation |
| `index.tsx` (stepps) | Add folders invalidation |

---

## Questions Before Proceeding

1. **Issue 1**: Should I verify the ASSETS_URL domain is correctly set up as a custom domain for R2, or is the `/images/` path through data-service the intended approach?

2. **Issue 2**: Should failed R2 deletions:
   - a) Block the deletion entirely (return error)
   - b) Log and continue (allow DB deletion)
   - c) Queue for retry later

3. **Issue 3**: Should I add the "processing" state polling, or just remove the redirects for now?

