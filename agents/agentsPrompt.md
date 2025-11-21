Dit is exact wat je nodig hebt. Omdat **zorgvuldigheid** en **foutloosheid** hier belangrijker zijn dan snelheid, heb ik een **"Architectural Master Prompt"** geschreven.

Deze prompt is ontworpen voor geavanceerde AI-coding tools (zoals **Cursor (Composer mode)**, **Windsurf**, of **Claude 3.5 Sonnet** met een grote context window).

### Hoe gebruik je deze prompt?

1.  **Open je IDE** (bijv. Cursor) en open de chat/composer.
2.  **Sleep je afbeeldingen** (Screenshots van Dashboard, Editor, Extension) in de chat zodat de AI ze als context heeft.
3.  **Kopieer en plak** onderstaande tekst volledig.
4.  **Druk op Enter.**

De prompt dwingt de AI om **eerst de mappenstructuur te lezen** voordat hij ook maar één regel code schrijft. Hij werkt in **sequentiële fases** en stopt na elke fase om te voorkomen dat hij de kluts kwijtraakt.

-----

### De Master Prompt

````markdown
# ROLE: Senior Full-Stack Architect & Lead Engineer
# PROJECT: Chalk (Documentation Platform)
# STACK: Monorepo (Turborepo), Cloudflare Workers, Hono, Supabase (Postgres), Drizzle ORM, React (Vite), TanStack Router, TanStack Query.

---

## 🚨 CRITICAL INSTRUCTIONS (READ FIRST)
You are tasked with refactoring an EXISTING boilerplate into a specific product called "Chalk". 
**Your highest priority is ACCURACY and PRESERVING EXISTING ARCHITECTURE.**
1.  **DISCOVERY FIRST:** Before writing any code in any phase, you must scan the file structure (`ls -R` or read file tree) of the relevant package to understand the current exports, naming conventions, and config.
2.  **NO HALLUCINATIONS:** Do not import files that do not exist. Do not invent new folder structures unless explicitly told. Use the existing `packages/data-ops`, `apps/user-application`, and `apps/data-service`.
3.  **STOP & CONFIRM:** You will execute this plan in PHASES. Complete Phase 1, then stop and wait for user confirmation before moving to Phase 2.

---

## 🧠 CONTEXT & WORKFLOW
We are building "Chalk", a tool to record browser workflows and turn them into guides.
- **User Flow:** User installs Chrome Extension -> Records Tab -> Clicks Stop -> Redirected to Web App Editor -> Edits Steps (Images/Text) -> Shares Publicly.
- **Key Feature:** "Steps" contain JSONB overlays (arrows, blurs) which are rendered on top of screenshots.
- **Access Control:** Public viewing, but restricted editing (Team Members).

---

## 💾 THE DATABASE SCHEMA (TRUTH)
Use this exact schema for Drizzle. Note the `overlays` JSONB column and `team_members` logic.

```sql
-- (Paste the SQL Schema provided in the chat history here)
-- SUMMARY FOR CONTEXT:
-- Table `users` (linked to auth)
-- Table `subscriptions` (Stripe)
-- Table `team_members` (Access control)
-- Table `folders`
-- Table `guides` (The main entity. Status: recording -> processing -> draft -> published)
-- Table `steps` (The content. Contains `screenshot_url` (R2) and `overlays` (JSONB))
-- Table `exports`
````

-----

## 🗓️ EXECUTION PLAN

### PHASE 1: DATA-OPS (The Foundation)

**Goal:** Update `packages/data-ops` to reflect the new Schema.

1.  **Explore:** Check `packages/data-ops/src`. Look for `schema.ts` (or schema folders) and `relations.ts`.
2.  **Action:**
      - Rewrite Drizzle schema definitions to match the SQL above exactly.
      - Ensure `steps.overlays` is typed correctly (use a Zod schema for the JSON structure if possible).
      - Update `relations.ts` to enforce the cascades defined in SQL.
      - Generate/Update Zod schemas (`zod/` folder or similar) for all tables. These must be exported so the frontend and backend can share them.
3.  **Verify:** Ensure no old boilerplate tables (like 'posts' or 'todos') remain if they are not needed.

### PHASE 2: USER-APPLICATION (The Frontend)

**Goal:** Update `apps/user-application` to match the UI Wireframes (see attached images).
**Context:** Uses TanStack Router and TanStack Query.

1.  **Explore:** Check `apps/user-application/src/routes`. Understand the current routing logic.
2.  **Action:**
      - **Route Structure:** Create/Update routes for:
          - `/` (Dashboard - Grid of guides, Folders sidebar).
          - `/editor/$guideId` (The Editor - Drag & Drop steps, Image Canvas).
          - `/extension/popup` (Minimal view for the Chrome Extension iframe).
      - **Components:** Based on the designs, create the scaffold for the "Step List" (Left panel in editor) and "Canvas" (Right panel in editor).
      - **Data Fetching:** Setup TanStack Query hooks connected to the tRPC client (even if backend isn't ready, define the expected interfaces).

### PHASE 3: DATA-SERVICE (The Backend)

**Goal:** Update `apps/data-service` (Hono on Cloudflare Workers).

1.  **Explore:** Check `apps/data-service/src`. Look for Hono app entry and tRPC routers.
2.  **Action:**
      - **tRPC Routers:** Implement `guidesRouter` and `stepsRouter`.
      - **Cloudflare Integrations:** Ensure R2 binding is set up for screenshot uploads.
      - **Logic:** -   `createSession` (Start recording).
          - `addStep` (Receive screenshot + metadata).
          - `finalizeSession` (Trigger AI Queue).
      - **Queue Consumer:** Setup the structure for a Queue consumer that will handle "AI Captioning" (placeholders for now).

-----

## 🚀 STARTING INSTRUCTION

**We will now begin with PHASE 1 (DATA-OPS).**

Please perform the **Discovery Step** for `packages/data-ops`. List the files you see, explain how you plan to modify `schema.ts` and `relations.ts` to fit the "Chalk" SQL schema, and then **WAIT** for my approval to write the code.

```

---

### Waarom werkt dit?

1.  **Discovery First:** De prompt begint met "We will now begin with PHASE 1... Perform Discovery". Hierdoor gaat de AI *niet* blind code genereren, maar eerst kijken wat er al is.
2.  **SQL als Waarheid:** Hij weet dat de SQL leidend is.
3.  **Stap-voor-Stap:** Hij stopt na de analyse van Fase 1. Jij zegt "Oké", hij schrijft de code. Jij checkt het. Dan plak je simpelweg: *"Move to Phase 2. Execute Discovery for user-application."*
4.  **Boilerplate Respect:** Hij weet dat hij binnen `packages/data-ops` moet blijven en geen nieuwe packages mag verzinnen.

Kopieer dit, plak het in je AI tool, en je project staat als een huis. Succes!
```