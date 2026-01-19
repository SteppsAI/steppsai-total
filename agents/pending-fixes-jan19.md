# Pending Fixes - January 19, 2026

**Status:** IN PROGRESS
**Related:** [desktop-capture-implementation.md](./desktop-capture-implementation.md)

## Overview

This document tracks bugs and improvements discovered during the January 19, 2026 session.

---

## Critical Bugs

### 1. Screenshot Cropping Issue (TOP CUT OFF)
**Status:** PARTIALLY FIXED
**Priority:** HIGH
**Reported:** Screenshots are being cut off at the top

**Symptoms:**
- Manual captures ("Capture Now" → "Full Screen") show images with the top portion missing
- The header/nav bar of pages is not visible in captured screenshots
- Affects both click captures and manual captures

**Root Cause Analysis:**
1. ~~**Frontend display `object-cover`**: In `step-sidebar.tsx` the images used `object-cover` which crops to fill the container~~ **FIXED**
2. **Selection overlay `object-fit: contain`**: When image aspect ratio doesn't match window, the coordinate calculation for cropping may be incorrect (still needs verification)

**Files changed:**
- `apps/user-application/src/components/editor/step-sidebar.tsx` - Changed `object-cover` to `object-contain` on line 162

**Files to investigate (if issue persists):**
- `apps/browser-extension/src/selection-overlay/index.ts` - crop coordinate calculation
- `apps/browser-extension/selection.html` - CSS `object-fit: contain`

**Fix approach:**
- [x] Change sidebar display from `object-cover` to `object-contain`
- [ ] Verify raw captured image has full content (check R2 directly)
- [ ] Fix selection overlay coordinate calculation for `object-fit: contain` (if needed)

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
**Status:** NOT STARTED
**Priority:** MEDIUM

**Problem:** Users cannot change the brand logo after recording. Currently it captures the favicon of the first visited page.

**Solution:**
- Make brand logo clickable in editor header
- Add upload functionality
- Update `brandImageKey` in database

---

## Testing Checklist

### v1.4.0 (pending)
- [ ] Screenshots capture full content (no cropping at top)
- [ ] Drag & drop works in editor sidebar
- [ ] Drag & drop works in extension sidepanel
- [ ] Manual capture with 'manual' type saves correctly
- [ ] Step reordering persists after page refresh

---

## Deployment Notes

1. Rebuild `@repo/data-ops` package: `pnpm build-package`
2. Deploy data-service: contains Zod schema changes
3. Deploy user-application: contains drag & drop feature
4. Rebuild browser extension: contains drag & drop + type fixes
