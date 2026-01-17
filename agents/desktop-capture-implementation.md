# Desktop Capture Implementation Plan

**Date:** January 17, 2026
**Goal:** Enable screen/window capture beyond browser tabs using Chrome's `desktopCapture` API

## Current State

The extension uses `chrome.tabs.captureVisibleTab()` which only captures the visible browser tab content. Users cannot record native Mac apps or other windows.

**Current capture code** (`apps/browser-extension/src/background/index.ts:327-329`):
```typescript
const pngDataUrl = await chrome.tabs.captureVisibleTab(chrome.windows.WINDOW_ID_CURRENT, {
    format: 'png'
});
```

## Target State

Users see a Chrome picker dialog allowing them to select:
- **Entire Screen** - Captures everything visible on the display
- **Window** - Captures a specific application window
- **Tab** - Captures a browser tab (current behavior)

## Architecture

```
User clicks in page
       ↓
Content Script sends STEP_ACTION
       ↓
Background Script
       ↓
chrome.desktopCapture.chooseDesktopMedia() → User picks screen/window/tab
       ↓
Creates offscreen document (if needed)
       ↓
Sends streamId to offscreen document
       ↓
Offscreen: getUserMedia() → video → canvas → dataURL
       ↓
Sends dataURL back to background
       ↓
Background: converts to WebP, uploads to R2, saves step
```

## Why Offscreen Document?

In Manifest V3, service workers cannot access DOM APIs like `<video>`, `<canvas>`, or `getUserMedia()`. The offscreen document provides a DOM context to:
1. Create a MediaStream from the desktop capture stream ID
2. Render the stream to a video element
3. Draw a frame to canvas
4. Export as data URL

## Implementation Steps

### Step 1: Update manifest.json ✅ DONE
- Added `desktopCapture` permission
- Added `offscreen` permission
- Bumped version to `1.1.0`

### Step 2: Create Offscreen HTML ✅ DONE
**File:** `apps/browser-extension/offscreen.html`

Minimal HTML with hidden video and canvas elements for frame capture.

### Step 3: Create Offscreen Script ✅ DONE
**File:** `apps/browser-extension/src/offscreen/index.ts`

Handles messages from background:
- `INIT_STREAM`: Initialize persistent stream from streamId
- `CAPTURE_FRAME`: Capture frame from active stream, returns dataURL
- `STOP_STREAM`: Stop and cleanup the stream

### Step 4: Update Vite Config ✅ DONE
**File:** `apps/browser-extension/vite.config.ts`

Added offscreen.html to build inputs.

### Step 5: Update Background Script ✅ DONE
**File:** `apps/browser-extension/src/background/index.ts`

Changes made:
- Added `ensureOffscreenDocument()` and `closeOffscreenDocument()` helpers
- Added `startDesktopCapture()`: Shows picker ONCE when recording starts, initializes persistent stream
- Added `captureFrame()`: Captures frame from the active stream (no picker)
- Added `stopDesktopCapture()`: Stops stream and closes offscreen document
- Modified `handleStartRecording()`: Prompts for capture source before creating guide
- Modified `handleStopRecording()`: Stops capture stream on completion
- Modified `handleDiscardRecording()`: Stops capture stream on discard
- Modified `handleStepAction()`: Uses `captureFrame()` instead of `chrome.tabs.captureVisibleTab()`

### Step 6: Source Selection Cached ✅ DONE
The user selects the capture source ONCE when starting a recording. The same source is used for all steps in the session.

## Files Changed

| File | Action |
|------|--------|
| `public/manifest.json` | ✅ Modified (permissions, version) |
| `offscreen.html` | Create new |
| `src/offscreen/index.ts` | Create new |
| `vite.config.ts` | Modify (add build input) |
| `src/background/index.ts` | Modify (new capture logic) |

## Chrome Web Store Submission

### Permission Justification for `desktopCapture`
> "This permission allows users to capture screenshots of their entire screen, specific windows, or browser tabs when creating step-by-step guides. Users are prompted to select their capture source each time, giving them full control over what is recorded."

### Updated Description
> "Turn any workflow into an SOP in seconds. Stepps.ai can now capture your entire screen, specific application windows, or browser tabs - perfect for documenting workflows that span multiple applications."

## Rollback Plan

If issues arise, revert to previous version by:
1. Removing `desktopCapture` and `offscreen` permissions from manifest
2. Restoring `chrome.tabs.captureVisibleTab()` in background script
3. Removing offscreen document files
4. Reverting version to `1.0.2`
