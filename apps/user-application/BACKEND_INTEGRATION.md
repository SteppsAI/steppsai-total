# Backend Integration Checklist

### 1. [`worker/auth.ts`](worker/auth.ts)
**Status:** Entire file is commented out  
**Action:** Uncomment and configure Better-Auth with Google OAuth + email/password

### 2. [`worker/trpc/context.ts`](worker/trpc/context.ts)
**Action:** Wire up auth session to populate `userId` from the authenticated user

### 3. [`worker/trpc/routers/guides.ts:17`](worker/trpc/routers/guides.ts#L17)
**Action:** Replace `const userId = "user_123"` with `ctx.userInfo.userId`

---

## 📁 Guides & Stepps (Core Feature)

### 4. [`src/hooks/use-stepps.ts`](src/hooks/use-stepps.ts)
**Status:** Uses `TEST_GUIDES` + `setTimeout` to fake API calls  
**Action:** Replace all functions with tRPC calls:
- `fetchStepps` → `trpc.guide.getAll.useQuery()`
- `fetchStepp` → `trpc.guide.getById.useQuery()`
- `createStepp` → `trpc.guide.create.useMutation()`
- `updateStepp` → `trpc.guide.update.useMutation()`
- `deleteStepp` → `trpc.guide.delete.useMutation()`

### 5. [`src/routes/app/_authed/editor/$guideId.tsx`](src/routes/app/_authed/editor/$guideId.tsx)
**Status:** Editor saves locally but doesn't persist  
**Action:** Wire up mutations for:
- Updating step titles/captions
- Saving annotations/overlays
- Deleting steps → `trpc.step.delete.useMutation()`
- Reordering steps → `trpc.step.reorder.useMutation()`
- Adding new steps (handle screenshot uploads)

---

## 📂 Folders

### 6. [`src/hooks/use-folders.ts`](src/hooks/use-folders.ts)
**Status:** Fully mocked, `useQuery` is disabled (`enabled: false`)  
**Action:** 
- Create tRPC router for folders (doesn't exist yet)
- Replace all `folderApi` functions with tRPC calls
- Enable the queries

### 7. [`src/components/dashboard/folders-section.tsx:21`](src/components/dashboard/folders-section.tsx#L21)
**Action:** Uncomment `trpc.folder.getAll.useQuery()`

---

## 🏠 Dashboard

### 8. [`src/routes/app/_authed/index.tsx:34-35`](src/routes/app/_authed/index.tsx#L34-L35)
**Action:** Uncomment tRPC hooks:
- `trpc.guide.getRecent.useQuery({ limit: 4 })`
- `trpc.folder.getAll.useQuery()`

### 9. [`src/components/dashboard/recent-stepps.tsx:24`](src/components/dashboard/recent-stepps.tsx#L24)
**Action:** Uncomment `trpc.guide.getRecent.useQuery()`

---

## 🚀 Export & Share

### 10. [`src/components/export-dialog.tsx:44`](src/components/export-dialog.tsx#L44)
**Action:** Create tRPC endpoint for `guide.export` that:
- Accepts `{ guideId, format: "pdf" | "markdown" | "word" }`
- Returns a downloadable file

### 11. [`src/components/share-dialog.tsx:41`](src/components/share-dialog.tsx#L41)
**Action:** Create tRPC endpoint for `guide.invite` to send email invitations

---

## ⚙️ Settings Page

### 12. [`src/routes/app/_authed/settings.tsx`](src/routes/app/_authed/settings.tsx)
**Actions needed:**
- **Line 77:** Avatar upload endpoint
- **Line 84:** Update user profile (name)
- **Line 100:** Trigger password reset email
- **Line 104:** Sign out (clear session)
- **Line 126 & 139:** Stripe customer portal redirect
- **Line 163:** Update notification preferences

---

## 🔍 Search (Optional - Can Do Later)

### 13. [`src/routes/app/_authed.tsx:38`](src/routes/app/_authed.tsx#L38)
**Action:** Add server-side search with query params

### 14. [`src/routes/app/_authed/stepps/index.tsx:184`](src/routes/app/_authed/stepps/index.tsx#L184)
**Action:** Backend filtering for visibility (public/private)
