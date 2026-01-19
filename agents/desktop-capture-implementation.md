# Desktop Capture Implementation

**Date:** January 18, 2026
**Status:** ✅ COMPLETED
**Version:** 1.2.0

## Summary

Implemented full screen, window, and tab capture using the `getDisplayMedia` API, replacing the previous `captureVisibleTab` approach that only worked for browser tabs.

## What Changed

### Before (v1.0.x)
- Used `chrome.tabs.captureVisibleTab()` - only captured browser tab content
- Could not record native Mac apps or other windows
- Click coordinates were viewport-relative

### After (v1.1.0)
- Uses `navigator.mediaDevices.getDisplayMedia()` via offscreen document
- User can choose: **Entire Screen**, **Window**, or **Tab**
- Automatic coordinate system detection for accurate marker positioning
- Can now record native applications, other browser windows, etc.

### After (v1.2.0) - January 18, 2026
- **Stream validation & auto-recovery**: Fixed issue where manual capture would fail silently when Chrome closed the offscreen document or stream
- **New `CHECK_STREAM_STATUS` message**: Offscreen document can now report if stream is actually alive
- **`ensureActiveCaptureStream()`**: Validates stream before each capture, auto-restarts if lost
- **Major refactoring**: Split 700+ line `background/index.ts` into modular structure:
  ```
  background/
  ├── index.ts              # 64 lines - Only listeners
  ├── capture/
  │   ├── offscreen.ts      # Offscreen document management
  │   └── desktop-capture.ts # Capture + stream validation
  ├── handlers/
  │   ├── recording.ts      # Start/stop/discard
  │   ├── step-actions.ts   # Manual + click capture
  │   └── navigation.ts     # Navigation handler
  └── helpers/
      ├── favicon.ts        # Brand logo capture
      └── content-script.ts # Script injection
  ```

## Architecture

```
User clicks "Start Recording"
       ↓
Background creates offscreen document
       ↓
Offscreen calls getDisplayMedia() → Chrome picker appears
       ↓
User selects capture source (screen/window/tab)
       ↓
Stream stays open for the session
       ↓
User clicks in browser → Content script sends coordinates
       ↓
Background requests frame from offscreen
       ↓
Offscreen captures frame + returns captureType
       ↓
Background uses correct coordinates based on captureType
       ↓
Screenshot uploaded to R2 with correct marker position
```

## Coordinate Systems

The content script sends three coordinate systems, and the background picks the correct one based on detected capture type:

| Capture Type | Detection Method | Coordinates |
|--------------|------------------|-------------|
| `screen` | Video matches screen dimensions | `screenX/Y` (absolute screen position) |
| `window` | Video matches browser window dimensions | `windowX/Y` (viewport + toolbar offset) |
| `tab` | Default / video matches viewport | `viewportX/Y` (viewport-relative) |

## Files Modified

### v1.1.0
| File | Changes |
|------|---------|
| `public/manifest.json` | Added `offscreen` permission, version 1.1.0 |
| `offscreen.html` | **NEW** - HTML for offscreen document |
| `src/offscreen/index.ts` | **NEW** - Handles getDisplayMedia, frame capture, type detection |
| `src/background/index.ts` | New capture flow, coordinate selection logic |
| `src/content/index.ts` | Sends all three coordinate systems |
| `vite.config.ts` | Added offscreen.html to build, relative paths |

### v1.2.0
| File | Changes |
|------|---------|
| `src/offscreen/index.ts` | Added `CHECK_STREAM_STATUS` message handler, `isActive` in response type |
| `src/background/index.ts` | **REFACTORED** - Now only contains message listeners (64 lines) |
| `src/background/capture/offscreen.ts` | **NEW** - Offscreen document management |
| `src/background/capture/desktop-capture.ts` | **NEW** - Capture functions + stream validation |
| `src/background/capture/index.ts` | **NEW** - Re-exports |
| `src/background/handlers/recording.ts` | **NEW** - Start/stop/discard recording |
| `src/background/handlers/step-actions.ts` | **NEW** - Manual capture, click capture, delete step |
| `src/background/handlers/navigation.ts` | **NEW** - Navigation handler |
| `src/background/handlers/index.ts` | **NEW** - Re-exports |
| `src/background/helpers/favicon.ts` | **NEW** - Brand logo capture |
| `src/background/helpers/content-script.ts` | **NEW** - Content script injection |
| `src/background/helpers/index.ts` | **NEW** - Re-exports |

## Permissions

**Removed:**
- `desktopCapture` - not needed with getDisplayMedia approach

**Added:**
- `offscreen` - required for offscreen document that calls getDisplayMedia

**Unchanged:**
- `activeTab`, `scripting`, `sidePanel`, `storage`, `tabs`, `webNavigation`
- `host_permissions`: `<all_urls>`

## Chrome Web Store Submission

### Permission Justification (for `offscreen`)

> This permission enables screen capture functionality. When users start a recording, they can choose to capture their entire screen, a specific window, or a browser tab. This allows documenting workflows that span multiple applications, not just browser content.

### Updated Store Description

> **Turn any workflow into an SOP in seconds.**
>
> Stepps.ai now supports full screen, window, and tab capture - perfect for documenting workflows that go beyond the browser.
>
> **What's New in v1.1.0:**
> - Capture your entire screen, specific windows, or browser tabs
> - Document workflows across any application (Notion, Figma, Terminal, etc.)
> - Accurate click markers regardless of capture mode
> - Chrome's built-in picker gives you full control over what's recorded

### Privacy Consideration

The `getDisplayMedia` API shows Chrome's native permission dialog, giving users full control and transparency over what is being captured. No automatic or silent screen recording is possible.

## Testing Checklist

### v1.1.0
- [x] Chrome-Tab capture - viewport coordinates work correctly
- [x] Fenster (Window) capture - window coordinates with toolbar offset work correctly
- [x] Gesamter Bildschirm (Full Screen) capture - screen coordinates work correctly
- [x] Multiple recording sessions work (start → stop → start again)
- [x] Discard recording cleans up properly
- [x] Recording works after browser restart

### v1.2.0
- [ ] Manual capture works after stream is lost (should show picker again)
- [ ] Click capture continues to work after stream recovery
- [ ] All handlers work correctly after refactoring
- [ ] No TypeScript errors in build

## Rollback Plan

If issues arise in production:
1. Revert manifest version to 1.0.x
2. Remove `offscreen` permission
3. Remove offscreen.html and src/offscreen/
4. Restore `chrome.tabs.captureVisibleTab()` in background script
5. Restore viewport-only coordinates in content script
