# ROLE: Senior Full-Stack Architect & Lead Engineer
# PROJECT: Stepps.ai (formerly Chalk)
# STACK: Monorepo (Turborepo), Cloudflare Workers, Hono, Supabase (Postgres), Drizzle ORM, React (Vite).
# LIBS: TanStack Router (File-based), TanStack Query, shadcn/ui (Radix), Tailwind CSS.

---

## 🚨 CRITICAL INSTRUCTIONS (READ FIRST)
You are tasked with refactoring an EXISTING boilerplate into a product called **"Stepps.ai"**.
**Your highest priority is ACCURACY and PRESERVING EXISTING ARCHITECTURE.**

1.  **DISCOVERY FIRST:** Before writing code in any phase, scan the file structure (`ls -R` or read file tree).
2.  **NO HALLUCINATIONS:** Do not invent new packages. Work within `packages/data-ops`, `apps/user-application`, and `apps/data-service`.
3.  **PRESERVE CONFIG:** Do not overwrite `tsconfig.json`, `vite.config.ts` or `routerTree.gen.ts` unless absolutely necessary for the refactor.
4.  **STRICT PHASED EXECUTION:** Stop after each phase to confirm with the user.

---

## 🎨 DESIGN SYSTEM & BRANDING (TRUTH)
**Product Name:** Stepps.ai
**Vibe:** Professional, Clean, "Documentation that writes itself".
**Colors:**
- Primary: `#6366F1` (Indigo) - Use Tailwind `indigo-500` or custom config.
- Neutrals: Slate/Zinc specific for shadcn.
**Typography (Use Next.js/Vite font loaders or CSS imports):**
- **Headings:** `Space Grotesk` (Weights: 300-700). Variable: `--font-space-grotesk`.
- **Body/UI:** `Inter` (Weights: 300-700). Variable: `--font-inter`.

---

## 🗓️ EXECUTION PLAN

### PHASE 1: DATA-OPS (The Foundation)

**Goal:** Update `packages/data-ops` to reflect the Schema.
* **Action:**
    - Scan `packages/data-ops/src`.
    - Update `schema.ts` to include: 
        - `users`, `subscriptions`, `team_members`.
        - `guides` (status: recording/draft/published).
        - `steps` (Must include `overlays` as JSONB and `screenshot_url` as text).
    - Export Zod schemas for the frontend to use.
    - **Wait for confirmation.**

---

### PHASE 2: USER-APPLICATION (The Frontend Logic & UI)

**Goal:** Implement the "Stepps.ai" flow using **TanStack Router**, **shadcn/ui**, and **TanStack Query**.

**⚠️ CRITICAL CONTEXT - READ THESE FILES FIRST:**
- `apps/user-application/src/routes` (Understand the current file-based routing).
- `apps/user-application/src/router.tsx` & `routerTree.gen.ts` (Do not break generation).
- `apps/user-application/src/components` (Check for existing shadcn components).
- `apps/user-application/vite.config.ts` (Check aliases).

#### 1. Global Configuration
-   Update `tailwind.config.ts`: Extend the theme to include `fontFamily` mapping for `Space Grotesk` (sans/heading) and `Inter` (body). Add the primary color `#6366F1`.
-   Ensure `index.css` or `globals.css` defines the CSS variables for the fonts.

#### 2. Route Structure & Components
*Use existing shadcn components (Card, Button, Input, ScrollArea) where possible.*

**A. The Dashboard (`/` or `/dashboard`)**
* **Visual Ref:** "Layout guides screen" / Media Library Grid.
* **Layout:**
    -   **Header:** Search bar (`Input`), Filters (`Select`), "Create Folder" (`Button` + `Dialog`).
    -   **Body:** Grid layout. `GuideCard` component showing thumbnail, title, and badge.
* **Tech:** `useQuery` to fetch guides.

**B. The Editor (`/editor/$guideId`)**
* **Visual Ref:** "Edit recording screen" (Split View).
* **Layout:**
    -   **Left Sidebar (The Steps):** Fixed width (e.g., w-80). Uses `ScrollArea`. Lists steps vertically. Each step has a thumbnail and editable description (`Textarea` or `Input`). Drag-and-drop handles (dnd-kit or similar if installed, otherwise simple list).
    -   **Center Canvas (The Stage):** Gray background. Centers the Screenshot.
    -   **Overlay Layer:** Absolute positioned `div`s on top of the image rendering the JSONB data (clicks/arrows).
    -   **Toolbar:** "Done Editing" (`Button`), "Share".
* **Tech:** `useQuery` for guide data, `useMutation` for auto-saving changes.

**C. The Recorder View (`/extension/popup`)**
* **Visual Ref:** "Chrome Extension" sketch.
* **Layout:** Minimalist, centered content. High contrast.
    -   **Idle:** Large Primary Button "Start Capture".
    -   **Recording:** Timer display, "Stop" (Red), "Pause" (Gray).

---

### PHASE 3: DATA-SERVICE (The Backend API)

**Goal:** Update `apps/data-service` (Hono/tRPC) to serve Phase 2.

1.  **tRPC Routers:**
    -   `guidesRouter`: Endpoints for `getAll` (dashboard) and `getById` (editor).
    -   `stepsRouter`: Endpoints for `update` (patching JSON overlays/text) and `reorder`.
2.  **R2 / Storage:**
    -   Verify the mechanism to get Signed URLs for uploading screenshots.

-----

## 🚀 STARTING INSTRUCTION

**We will now begin with PHASE 1 (DATA-OPS).**

Please perform the **Discovery Step** for `packages/data-ops`. 
1. List the files you see in that package.
2. Explain how you plan to modify `schema.ts` to fit the Stepps.ai schema (specifically the JSONB overlays).
3. **WAIT** for my approval before writing code.