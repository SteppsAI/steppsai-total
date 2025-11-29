# Step 4 Continuation - Frontend Fixes & Settings

## ✅ Beslissingen

| Beslissing | Antwoord |
|------------|----------|
| Settings Auth | Backend userId, geen extra hardcoding |
| Folders in Modal | Expandable (klik → toont guides) |
| Step Count | Extra kolom naast Title |
| Image URLs | **Complete URL opslaan in database** (niet alleen key) |

---

## Database Change (DONE BY USER)
- `users.avatar_url` - TEXT
- `users.notification_preferences` - JSONB default `{"newsletter": true}`

---

## Files to Modify

### 1. Image URL - Store Full URL in Database

**`apps/browser-extension/src/background/index.ts`**
- Line 128-129: Change `imageKey` to full URL 
- Need env var or config for base URL

**`apps/browser-extension/src/lib/config.ts`**
- Already has `DATA_SERVICE_URL` - use this to construct full URL

**`apps/data-service/src/hono/routes/guides.ts`**
- When processing steps, ensure URLs are complete

---

### 2. Editor Fixes

**`apps/user-application/src/routes/app/_authed/editor/$guideId.tsx`**
- Fix TypeScript errors
- `imageKey` will now be full URL, use directly in `<img src={...}>`
- Fix step type compatibility with `StepSidebar`

**`apps/user-application/src/components/editor/step-sidebar.tsx`**
- Update `Step` interface to match actual data structure
- Use `imageKey` (now full URL) instead of `screenshotUrl`

---

### 3. Dashboard - First Step Image

**`apps/user-application/src/components/dashboard/recent-stepps.tsx`**
- Get first step's `imageKey` from guide
- Use as image source (now full URL)
- Fallback to placeholder

**`apps/user-application/src/components/dashboard/dashboard-card.tsx`**
- May need to accept dynamic image prop

---

### 4. All Stepps - Step Count Column

**`apps/user-application/src/routes/app/_authed/stepps/index.tsx`**
- Add "Steps" column to table header
- Add `guide.steps?.length || 0` to table rows

---

### 5. Selection Modal - tRPC + Folders Expandable

**`apps/user-application/src/components/editor/stepp-selection-modal.tsx`**
- Remove `TEST_GUIDES`, `TEST_RECENT_GUIDES` imports
- Add loader with `prefetchQuery` or use `useSuspenseQuery`
- Fetch guides and folders via tRPC
- Recent: 4 most recent guides (sort by updatedAt)
- All Stepps section:
  - Expandable folders (click to show guides inside)
  - Guides NOT in folder shown separately
  - Don't show guides that ARE in a folder in the loose list

---

### 6. User Queries - Data Ops

**`packages/data-ops/src/queries/users.ts`** (NEW FILE)
```typescript
export async function getUser(userId: string): Promise<User | null>
export async function updateUser(userId: string, data: Partial<User>): Promise<void>
export async function updateNotificationPreferences(userId: string, prefs: NotificationPrefs): Promise<void>
```

**`packages/data-ops/src/queries/index.ts`**
- Add `export * from "./users";`

**`packages/data-ops/src/zod/users.ts`** (NEW FILE)
```typescript
export const userSchema = z.object({...})
export const updateUserSchema = z.object({...})
export const notificationPreferencesSchema = z.object({...})
```

**`packages/data-ops/src/zod/index.ts`**
- Add `export * from "./users";`

---

### 7. User tRPC Router

**`apps/user-application/worker/trpc/routers/users.ts`** (NEW FILE)
```typescript
export const usersRouter = router({
  getMe: publicProcedure.query(),
  updateProfile: publicProcedure.input().mutation(),
  updateNotifications: publicProcedure.input().mutation(),
});
```

**`apps/user-application/worker/trpc/router.ts`**
- Import and add `users: usersRouter`

---

### 8. Profile Picture Upload

**`apps/data-service/src/hono/routes/images.ts`**
- Already handles uploads, just use different key pattern
- Key format: `profile_pictures/{user_id}/{image_uuid}.webp`

**`apps/user-application/worker/trpc/routers/users.ts`**
- Add `uploadAvatar` mutation that:
  1. Uploads to data-service via BACKEND_SERVICE binding
  2. Updates user.avatar_url in DB

---

### 9. Settings Page Integration

**`apps/user-application/src/routes/app/_authed/settings.tsx`**
- Add loader with `prefetchQuery` for user data
- Add `useSuspenseQuery` for user
- Add mutations for:
  - Update name
  - Upload avatar
  - Update notification preferences
- Wire up buttons/forms to mutations

---

### 10. Error Handling

**`apps/user-application/src/components/editor/stepp-selection-modal.tsx`**
- Add error boundary or try/catch
- Graceful fallback if data fails to load

---

## Summary: Files to Create/Modify

### New Files (4)
1. `packages/data-ops/src/queries/users.ts`
2. `packages/data-ops/src/zod/users.ts`
3. `apps/user-application/worker/trpc/routers/users.ts`

### Modified Files (12)
1. `apps/browser-extension/src/background/index.ts` - Full URL in imageKey
2. `apps/user-application/src/routes/app/_authed/editor/$guideId.tsx` - Fix errors
3. `apps/user-application/src/components/editor/step-sidebar.tsx` - Fix Step interface
4. `apps/user-application/src/components/editor/stepp-selection-modal.tsx` - tRPC + folders
5. `apps/user-application/src/components/dashboard/recent-stepps.tsx` - First step image
6. `apps/user-application/src/routes/app/_authed/stepps/index.tsx` - Steps column
7. `apps/user-application/src/routes/app/_authed/settings.tsx` - Full integration
8. `apps/user-application/worker/trpc/router.ts` - Add users router
9. `packages/data-ops/src/queries/index.ts` - Export users
10. `packages/data-ops/src/zod/index.ts` - Export users

---

## Order of Implementation

1. Browser extension: Store full URL
2. Editor fixes
3. Step sidebar fixes
4. Dashboard first step image
5. Steps column in table
6. User queries + zod (data-ops)
7. Users tRPC router
8. Settings page
9. Selection modal refactor
10. Error handling
