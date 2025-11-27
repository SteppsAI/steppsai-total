# Recording Bugfix & Enhancement Plan

## Problemen Gevonden

### 🐛 Bug 1: Database Insert Fout
**Error:**
```
Failed query: insert into "guides" ("id", "user_id", "folder_id", "title", "description", "slug", "status", "visibility", "created_at", "updated_at") values ($1, $2, default, $3, $4, $5, $6, $7, default, default)
```

**Root Cause:**
De queue handler roept `handleRecordingIngest` aan, maar de database wordt niet opnieuw geïnitialiseerd in de queue context. In Cloudflare Workers draait `queue()` apart van `fetch()` - de `initDatabase()` moet ook in de queue handler worden aangeroepen.

**Fix:** In `apps/data-service/src/index.ts` de database initialiseren aan het begin van de `queue()` method.

---

### ✨ Feature 1: Steps Weergeven in Sidebar
**Huidige situatie:** De sidebar toont alleen de laatste step preview.

**Gewenst:** Elke step met een beschrijving ("Click on [element]") tonen zoals je schets.

**Plan:**
1. Helper functie maken in `apps/data-service/src/helpers/index.ts` die een DOM selector omzet naar een leesbare actie tekst
2. Sidebar updaten om alle steps te tonen met een scroll list
3. Per step een "Click here" beschrijving genereren

---

## Implementatie Stappen

### Stap 1: Database Bug Fixen
**File:** `apps/data-service/src/index.ts`
- `initDatabase(env.DATABASE_URL)` toevoegen aan begin van `queue()` method

### Stap 2: Helper Functie voor Actie Beschrijvingen
**File:** `apps/data-service/src/helpers/index.ts`
```typescript
export function generateStepDescription(domSelector: string): string {
  // Parse selector en maak leesbare tekst
  // "button#submit" → "Click on Submit button"
  // "textarea#APjFqb" → "Click on textarea"
}
```

### Stap 3: Sidebar Steps List UI
**File:** `apps/browser-extension/src/sidepanel/SidePanelApp.tsx`
- Voeg een scrollable list toe met alle steps
- Elke step toont: nummer, beschrijving, kleine thumbnail

---

## Architectuur Overzicht

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Extension                        │
├─────────────────────────────────────────────────────────────┤
│  Content Script (click capture)                             │
│       ↓                                                     │
│  Background Script                                          │
│       ├── Screenshot → Upload to R2                         │
│       └── Step metadata → chrome.storage.local              │
│                ↓                                            │
│  Side Panel (React UI)                                      │
│       └── Luistert naar storage changes                     │
│       └── Toont ALLE steps met beschrijvingen  ← NEW        │
└─────────────────────────────────────────────────────────────┘
                         ↓ (Stop Recording)
┌─────────────────────────────────────────────────────────────┐
│                      Data Service                           │
├─────────────────────────────────────────────────────────────┤
│  POST /guides/ingest                                        │
│       ↓                                                     │
│  Cloudflare Queue                                           │
│       ↓                                                     │
│  Queue Handler (met DB init fix) ← BUG FIX                  │
│       ↓                                                     │
│  PostgreSQL (Guide + Steps insert)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Te Implementeren Nu

1. ✅ Fix database init in queue handler
2. ✅ Helper functie voor step beschrijvingen  
3. ✅ Steps list in sidebar

Ga ik hiermee akkoord? Dan begin ik met implementatie.


