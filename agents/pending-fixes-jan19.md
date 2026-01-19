# Pending Fixes - January 19, 2026

**Status:** IN PROGRESS
**Related:** [desktop-capture-implementation.md](./desktop-capture-implementation.md)

## Overview

This document tracks bugs and improvements discovered during the January 19, 2026 session.

---

## Critical Bugs

### 1. Screenshot Cropping Issue (TOP CUT OFF)
**Status:** FIXED ✅
**Priority:** HIGH
**Reported:** Screenshots are being cut off at the top

**Symptoms:**
- Manual captures ("Capture Now" → "Full Screen") show images with the top portion missing
- The header/nav bar of pages is not visible in captured screenshots
- Affects both click captures and manual captures

**Root Cause:**
The selection overlay uses `object-fit: contain` to display the captured screenshot. When the image aspect ratio doesn't match the window, letterboxing occurs (black bars on sides or top/bottom). The crop coordinate calculation was using the element bounds instead of the actual rendered image bounds, causing incorrect crop positions.

**Solution:**
Fixed `confirmSelection()` in `selection-overlay/index.ts` to:
1. Calculate the actual rendered image size within the `object-fit: contain` area
2. Calculate the letterbox offset (horizontal or vertical padding)
3. Adjust crop coordinates to account for this offset
4. Clamp values to ensure we don't go out of bounds

**Files changed:**
- `apps/browser-extension/src/selection-overlay/index.ts` - Fixed crop coordinate calculation for letterboxed images

---

### 2. Zod Schema Missing 'manual' Type - FIXED
**Status:** FIXED
**Priority:** CRITICAL (caused data loss)

**Problem:** Extension sends `type: 'manual'` for manual captures, but Zod schema only accepted `'click' | 'navigate'`

**Solution:**
- Added `'manual'` to `stepSchema` and `stepFromExtensionSchema` in `packages/data-ops/src/zod/steps.ts`
- Updated `recording-ingest.ts` to generate "Screenshot" caption for manual steps

**Files changed:**
- `packages/data-ops/src/zod/steps.ts`
- `apps/data-service/src/queue-handlers/recording-ingest.ts`

---

## New Features Implemented

### 1. Drag & Drop Step Reordering
**Status:** IMPLEMENTED
**Files:**
- `apps/user-application/src/components/editor/step-sidebar.tsx` - Uses @dnd-kit
- `apps/browser-extension/src/sidepanel/SidePanelApp.tsx` - Uses native HTML5 drag & drop

**How it works:**
- **Editor:** Drag the grip handle (⋮⋮) to reorder steps, persists to Durable Object
- **Extension:** Drag steps during recording, persists to chrome.storage.local

---

## Pending Improvements

### 1. Recording Retry System
**Status:** NOT STARTED
**Priority:** MEDIUM

**Problem:** If `recording.complete` fails, the user has no clear way to retry. The data stays in local storage but there's no UI to retry.

**Solution:**
- Add retry button when upload fails
- Show clearer error messages
- Add "Resume upload" feature

### 2. Brand Logo Change in Editor
**Status:** IMPLEMENTED ✅
**Priority:** MEDIUM

**Problem:** Users cannot change the brand logo after recording. Currently it captures the favicon of the first visited page.

**Solution:**
- Made brand logo clickable in editor header with camera icon overlay on hover
- Added hidden file input for image upload
- Uploads to R2 via `images.upload` mutation
- Updates `brandImageKey` in database via `guides.update` mutation
- Shows loading spinner while uploading
- Tooltip shows "Change brand logo" or "Add brand logo"

**Files changed:**
- `apps/user-application/src/components/editor/editor-header.tsx` - Clickable logo with upload UI
- `apps/user-application/src/routes/app/_authed/editor/$guideId.tsx` - Upload handler
- `apps/user-application/src/hooks/use-api.ts` - Added `useUploadImage` and `useUpdateGuide` hooks

---

## Testing Checklist

### v1.4.0 (pending)
- [x] Screenshots capture full content (no cropping at top)
- [ ] Drag & drop works in editor sidebar
- [ ] Drag & drop works in extension sidepanel
- [x] Manual capture with 'manual' type saves correctly
- [ ] Step reordering persists after page refresh

---

## Deployment Notes

1. Rebuild `@repo/data-ops` package: `pnpm build-package`
2. Deploy data-service: contains Zod schema changes
3. Deploy user-application: contains drag & drop feature
4. Rebuild browser extension: contains drag & drop + type fixes
