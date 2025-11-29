# Editor ↔ Data Service Integration Plan

## Overview

This document explains how editing functionality in the user-application needs to integrate with the data-service for saving/updating guide steps and overlays.

## Current Architecture

### Data Flow: Recording → Database

```
Browser Extension → data-service → Queue → Database
     ↓                    ↓
  Screenshots        /guides/start (creates guide)
  + DOM data         /guides/:id/complete (sends to queue)
                     /images/upload (R2 storage)
```

### Data Flow: Editor → Database (Current via user-application tRPC)

```
Editor UI → user-application tRPC → data-ops queries → Database
              ↓
         guides.update mutation
         (updates title, status, steps JSONB)
```

## The Problem

When editing in the editor (`/app/editor/$guideId.tsx`):

1. **Step overlays** (annotations like arrows, circles, blur boxes) need to be saved
2. **Step captions** need to be editable
3. **Step order** can be changed via drag & drop
4. **Steps can be deleted** or excluded

Currently, the `guides.update` tRPC mutation calls `updateGuide()` from data-ops which:
- Accepts `Partial<Guide>` including `steps`
- Stringifies steps to JSON for JSONB column
- Works BUT the overlay types don't match between frontend and backend

## Type Mismatch Issue

### Frontend Overlay Types (editor/canvas.tsx)
```typescript
interface ArrowAnnotation {
  id: string;
  type: 'arrow';
  points: [number, number, number, number]; // x1, y1, x2, y2
  color: string;
  strokeWidth: number;
}

interface CircleAnnotation {
  id: string;
  type: 'circle';
  x: number;
  y: number;
  radius: number;
  color: string;
  strokeWidth: number;
}

interface HideAnnotation {
  id: string;
  type: 'hide';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}
```

### Backend Overlay Types (data-ops/zod/steps.ts)
```typescript
const overlaySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("arrow"),
    from: z.tuple([z.number(), z.number()]),
    to: z.tuple([z.number(), z.number()]),
  }),
  z.object({
    type: z.literal("circle"),
    center: z.tuple([z.number(), z.number()]),
    radius: z.number(),
  }),
  z.object({
    type: z.literal("blur"),
    rect: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }),
  }),
]);
```

## Solution Options

### Option A: Align Backend Schema to Frontend (Recommended)

Update `packages/data-ops/src/zod/steps.ts` to match frontend types:

```typescript
const overlaySchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string(),
    type: z.literal("arrow"),
    points: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    color: z.string(),
    strokeWidth: z.number(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("circle"),
    x: z.number(),
    y: z.number(),
    radius: z.number(),
    color: z.string(),
    strokeWidth: z.number(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("hide"),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    color: z.string(),
  }),
]);
```

**Pros:**
- Single source of truth
- No transformation needed
- Frontend types work directly

**Cons:**
- Requires `pnpm run build` in data-ops
- May need migration if existing data uses old format

### Option B: Transform at API Boundary

Keep both schemas, transform in tRPC router:

```typescript
// In guides router update mutation
const transformOverlays = (frontendOverlays) => {
  return frontendOverlays.map(overlay => {
    if (overlay.type === 'arrow') {
      return {
        type: 'arrow',
        from: [overlay.points[0], overlay.points[1]],
        to: [overlay.points[2], overlay.points[3]],
      };
    }
    // ... etc
  });
};
```

**Pros:**
- No backend schema changes
- Backwards compatible

**Cons:**
- Complexity
- Two sources of truth
- Easy to introduce bugs

## Implementation Steps (Option A)

### Step 1: Update data-ops Overlay Schema

```bash
# File: packages/data-ops/src/zod/steps.ts
```

Update the overlay schema to match frontend types.

### Step 2: Rebuild data-ops

```bash
cd packages/data-ops
pnpm run build
```

### Step 3: Update Frontend Types

Ensure `apps/user-application/src/types/db.ts` exports the correct `Overlay` type that matches.

### Step 4: Update Editor Components

In `$guideId.tsx`:
- Remove type assertions (`as unknown as`)
- Let TypeScript verify type compatibility

### Step 5: Test the Flow

1. Open editor with existing guide
2. Add an arrow annotation
3. Save (should call `guides.update` mutation)
4. Refresh page - annotation should persist
5. Check database - steps JSONB should have overlay data

## Image Handling

### Current Flow
- Extension uploads to: `screenshots/{guideId}/{userId}/{stepId}.webp`
- Images served from data-service: `GET /images/{key}`
- Frontend stores full URL or just key in `step.imageKey`

### Editor Image Display
The `imageKey` field in steps can be:
1. **Full URL**: `https://api.stepps.ai/images/screenshots/...`
2. **Relative key**: `screenshots/guideId/userId/stepId.webp`

The Canvas component expects a URL, so if storing keys, prepend the data-service URL.

## Files to Modify

| File | Change |
|------|--------|
| `packages/data-ops/src/zod/steps.ts` | Update overlay schema |
| `apps/user-application/src/types/db.ts` | Ensure Overlay type matches |
| `apps/user-application/src/components/editor/canvas.tsx` | Verify types |
| `apps/user-application/src/routes/app/_authed/editor/$guideId.tsx` | Remove type assertions |

## Testing Checklist

- [ ] Create new annotation → saves to DB
- [ ] Edit existing annotation → updates in DB
- [ ] Delete annotation → removed from DB
- [ ] Reorder steps → order persists
- [ ] Delete step → removed from DB
- [ ] Edit step caption → saves to DB
- [ ] Reload page → all changes persist

## Notes

- The `updateGuide` function in data-ops already handles steps JSONB serialization
- No changes needed to data-service (it only handles recording flow)
- The tRPC `guides.update` mutation is the entry point for all editor saves

