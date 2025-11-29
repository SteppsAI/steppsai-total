# Step 4 Implementation Progress

## Status Overview

| # | Task | Status |
|---|------|--------|
| 1 | Browser extension: Store full URL | ⏸️ Reverted (partner working on it) |
| 2 | Fix step-sidebar.tsx interface | ✅ Completed |
| 3 | Dashboard - first step image | ✅ Completed |
| 4 | Steps column in table | ✅ Completed |
| 5 | Create users queries + zod | ✅ Completed |
| 6 | Create users tRPC router | ✅ Completed |
| 7 | Settings page integration | ✅ Completed |
| 8 | Selection modal - tRPC | ✅ Completed |
| 9 | Editor TypeScript errors | ✅ Fixed |

---

## Changes Made

### 1. Browser Extension - Full URL ⏸️ REVERTED

**Status:** Reverted - partner is working on browser extension

---

### 2. Step Sidebar - Interface Fix ✅

**File:** `apps/user-application/src/components/editor/step-sidebar.tsx`

- Changed `Step` interface from `{ title, screenshotUrl }` to `{ caption, imageKey }`
- Updated display to use `caption` with fallback `Step ${index + 1}`
- Updated image source to use `imageKey` directly

---

### 3. Dashboard - First Step Image ✅

**File:** `apps/user-application/src/components/dashboard/recent-stepps.tsx`

- Added logic to get first step's `imageKey` from guide
- Uses first step image as thumbnail
- Falls back to placeholder if no steps

---

### 4. Steps Column in Table ✅

**File:** `apps/user-application/src/routes/app/_authed/stepps/index.tsx`

- Added "Steps" column to table header
- Added step count cell: `guide.steps?.length || 0`
- Updated colSpan for empty state (6 → 7)

---

### 5. User Queries + Zod ✅

**New Files:**

- `packages/data-ops/src/zod/users.ts`
  - `notificationPreferencesSchema`
  - `userSchema`
  - `updateUserSchema`
  - `updateNotificationPreferencesSchema`

- `packages/data-ops/src/queries/users.ts`
  - `getUser(userId)`
  - `updateUser(userId, data)`
  - `updateNotificationPreferences(userId, prefs)`

**Updated:**
- `packages/data-ops/src/queries/index.ts` - Added export
- `packages/data-ops/src/zod/index.ts` - Added export

---

### 6. Users tRPC Router ✅

**New File:** `apps/user-application/worker/trpc/routers/users.ts`

- `getMe` - Get current user profile
- `updateProfile` - Update name/avatar
- `updateNotifications` - Update notification preferences
- `uploadAvatar` - Upload avatar image

**Updated:** `apps/user-application/worker/trpc/router.ts`
- Added `users: usersRouter`

---

### 7. Settings Page Integration ✅

**File:** `apps/user-application/src/routes/app/_authed/settings.tsx`

- Added loader with `prefetchQuery` for user data
- Added `useSuspenseQuery` for user
- Connected avatar upload to tRPC
- Connected name update to tRPC
- Connected newsletter toggle to tRPC
- Added loading states for mutations

---

### 8. Selection Modal - tRPC + Folders ✅

**File:** `apps/user-application/src/components/editor/stepp-selection-modal.tsx`

- Removed `TEST_GUIDES`, `TEST_RECENT_GUIDES` imports
- Added `useSuspenseQuery` for guides and folders
- Recent section: 4 most recent guides (sorted by updatedAt)
- Folders section: Expandable (click to show guides inside)
- Uncategorized section: Guides NOT in any folder
- Search works across all guides
- Shows step count for each guide

---

## Files Created

1. `packages/data-ops/src/zod/users.ts`
2. `packages/data-ops/src/queries/users.ts`
3. `apps/user-application/worker/trpc/routers/users.ts`

## Files Modified

1. `apps/browser-extension/src/background/index.ts`
2. `apps/user-application/src/components/editor/step-sidebar.tsx`
3. `apps/user-application/src/components/dashboard/recent-stepps.tsx`
4. `apps/user-application/src/routes/app/_authed/stepps/index.tsx`
5. `apps/user-application/src/routes/app/_authed/settings.tsx`
6. `apps/user-application/src/components/editor/stepp-selection-modal.tsx`
7. `apps/user-application/worker/trpc/router.ts`
8. `packages/data-ops/src/queries/index.ts`
9. `packages/data-ops/src/zod/index.ts`

---

## Notes

- Database changes (`users.avatar_url`, `users.notification_preferences`) were already done by user
- tRPC routers still use hardcoded userId - needs auth integration
- Avatar upload uses data-service URL directly (simplified implementation)
- Browser extension changes reverted - partner working on it
- Editor TypeScript errors fixed with proper type definitions

## Additional Fixes Made

### Editor Type System Fix

**Files Modified:**
- `apps/user-application/src/types/db.ts` - Updated `Overlay` type to match editor's annotation format
- `apps/user-application/src/components/editor/step-sidebar.tsx` - Now imports `Step` from db.ts
- `apps/user-application/src/components/editor/canvas.tsx` - Uses `Overlay` type alias from db.ts
- `apps/user-application/src/routes/app/_authed/editor/$guideId.tsx` - Added `LocalGuide` interface for proper typing

**Changes:**
- Created proper `ArrowAnnotation`, `CircleAnnotation`, `HideAnnotation` interfaces in db.ts
- `Overlay` type is now a union of these annotation types
- Editor now uses consistent types across all components
