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
**Actions needed:**
- **Line 156-160:** Update guide title → `trpc.guide.update.useMutation()`
- **Line 48-64:** Update step titles → `trpc.step.update.useMutation()`
- **Line 66-83:** Save annotations/overlays → `trpc.step.update.useMutation()`
- **Line 85-87:** Delete step → `trpc.step.delete.useMutation()`
- **Line 89-91:** Reorder steps → `trpc.step.reorder.useMutation()`
- **Line 93-122:** Add new step → `trpc.step.create.useMutation()` + file upload

### 6. [`src/components/editor/step-sidebar.tsx:106-111`](src/components/editor/step-sidebar.tsx#L106-L111)
**Status:** Has comment about backend integration for file upload  
**Action:** Upload screenshot file to storage (S3/R2) and create step with URL

---

## 📂 Folders

### 7. [`src/hooks/use-folders.ts`](src/hooks/use-folders.ts)
**Status:** Fully mocked, `useQuery` is disabled (`enabled: false`)  
**Action:** 
- Create tRPC router for folders (doesn't exist in backend yet)
- Replace all `folderApi` functions with tRPC calls
- Enable the queries

### 8. [`src/components/dashboard/folders-section.tsx:21`](src/components/dashboard/folders-section.tsx#L21)
**Action:** Uncomment `trpc.folder.getAll.useQuery()`

### 9. [`src/routes/app/_authed/index.tsx`](src/routes/app/_authed/index.tsx) - Dashboard Actions
**Actions needed:**
- **Line 34-35:** Uncomment tRPC hooks for recent guides and folders
- **Line 55-63:** `confirmDeleteFolder()` → `trpc.folder.delete.useMutation()`
- **Line 70-80:** `confirmRenameFolder()` → `trpc.folder.update.useMutation()`
- **Line 87-95:** `confirmDeleteStepp()` → `trpc.guide.delete.useMutation()`
- **Line 102-110:** `confirmMoveStepp()` → `trpc.guide.update.useMutation()` (update folder_id)

### 10. [`src/routes/app/_authed/stepps/index.tsx`](src/routes/app/_authed/stepps/index.tsx) - All Stepps Page
**Actions needed:**
- **Line 78:** Replace mock data with `trpc.guide.getAll.useQuery()` and `trpc.folder.getAll.useQuery()`
- **Line 119-127:** `confirmDeleteFolder()` → `trpc.folder.delete.useMutation()`
- **Line 134-144:** `confirmRenameFolder()` → `trpc.folder.update.useMutation()`
- **Line 151-159:** `confirmDeleteStepp()` → `trpc.guide.delete.useMutation()`
- **Line 166-181:** `confirmMoveStepp()` → `trpc.guide.update.useMutation()` (update folder_id)
- **Line 183-196:** `handleVisibilityChange()` → `trpc.guide.update.useMutation()` (update visibility)

---

## 🏠 Dashboard Components

### 11. [`src/components/dashboard/recent-stepps.tsx:24`](src/components/dashboard/recent-stepps.tsx#L24)
**Action:** Uncomment `trpc.guide.getRecent.useQuery()`

---

## 🚀 Export & Share

### 12. [`src/components/export-dialog.tsx:44`](src/components/export-dialog.tsx#L44)
**Action:** Create tRPC endpoint for `guide.export` that:
- Accepts `{ guideId, format: "pdf" | "markdown" | "word", fileName: string }`
- Returns a downloadable file (binary response)

### 13. [`src/components/share-dialog.tsx:41`](src/components/share-dialog.tsx#L41)
**Action:** Create tRPC endpoint for `guide.invite` to send email invitations

---

## ⚙️ Settings Page

### 14. [`src/routes/app/_authed/settings.tsx`](src/routes/app/_authed/settings.tsx)
**Actions needed:**
- **Line 77:** Avatar upload endpoint (file upload + user profile update)
- **Line 84:** Update user profile (name) → `trpc.user.update.useMutation()`
- **Line 100:** Trigger password reset email → `trpc.auth.resetPassword.useMutation()`
- **Line 104:** Sign out (clear session) → `trpc.auth.signOut.useMutation()`
- **Line 126 & 139:** Stripe customer portal redirect → `trpc.billing.createPortalSession.useMutation()`
- **Line 163:** Update notification preferences → `trpc.user.updatePreferences.useMutation()`

---

## 📧 Waitlist/Newsletter

### 15. [`src/lib/newsletterActions.ts:30-42`](src/lib/newsletterActions.ts#L30-L42)
**Status:** Mock implementation with `setTimeout`  
**Action:** Replace with real API call to newsletter service or tRPC endpoint

---

## 🔍 Search (Optional - Can Do Later)

### 16. [`src/routes/app/_authed.tsx:38`](src/routes/app/_authed.tsx#L38)
**Action:** Add server-side search with query params

### 17. [`src/routes/app/_authed/stepps/index.tsx:78`](src/routes/app/_authed/stepps/index.tsx#L78)
**Action:** Replace mock data fetching with real queries
