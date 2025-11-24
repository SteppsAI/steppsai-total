# Progress Report: Recording & Ingestion Implementation

Hier is een gedetailleerd overzicht van wat er is gebouwd voor **Stap 1** en **Stap 2**. Het doel was om de "Recording Engine" (Extensie) te verbinden met de "Ingestion API" (Data Service).

## 1. Chrome Extension (De "Ogen & Oren")
We hebben de extensie omgebouwd van een lege huls naar een werkende recorder.

### **Wat is er veranderd?**
*   **`manifest.json`**:
    *   **Toegevoegd**: `permissions: ["storage", "tabs"]` en `host_permissions: ["<all_urls>"]`.
    *   **Waarom?**: De extensie moet kunnen "zien" welke tab open staat en screenshots kunnen maken (`captureVisibleTab`) van elke website.
*   **`src/content/index.ts` (Nieuw)**:
    *   **Wat doet het?**: Dit script draait op *elke* pagina die je bezoekt.
    *   **Logica**: Het luistert naar elke **klik**. Als je klikt, berekent het een unieke "CSS Selector" (bijv. `div > button:nth-child(2)`) zodat we later weten *waar* je klikte. Dit stuurt hij naar de achtergrond.
*   **`src/background/index.ts` (Het Brein)**:
    *   **Wat doet het?**: Dit script draait onzichtbaar op de achtergrond.
    *   **Logica**:
        *   Luistert naar "Start Recording" -> Roept API aan -> Krijgt `guideId`.
        *   Luistert naar "Klik Bericht" van content script -> Maakt direct een **Screenshot** -> Stuurt screenshot + selector naar de API.
        *   Luistert naar "Stop Recording" -> Roept API aan om af te ronden.
*   **`src/sidepanel/SidePanelApp.tsx`**:
    *   De knoppen "Start" en "Stop" zijn nu echt aangesloten. Ze sturen signalen naar het `background` script in plaats van alleen lokale state aan te passen.

---

## 2. Data Service (De "Opslag")
Dit is de backend die de data ontvangt. We hebben deze geconfigureerd om met jouw Supabase Postgres database te praten.

### **Wat is er veranderd?**
*   **`wrangler.jsonc`**:
    *   **Aanpassing**: We zijn overgestapt van D1 (Cloudflare's eigen DB) naar `DATABASE_URL` (Jouw Supabase Postgres).
    *   **Waarom?**: Zodat `data-service` en `user-application` naar dezelfde database kijken.
*   **`src/hono/routes/guides.ts` (Nieuw)**:
    *   Dit zijn de API endpoints die de extensie aanroept:
    *   `POST /guides`: Maakt een nieuwe rij in de `guides` tabel (Status: `recording`).
    *   `POST /guides/:id/steps`: Ontvangt een screenshot + metadata en slaat dit op in de `steps` tabel. (Screenshot gaat naar R2).
    *   `POST /guides/:id/stop`: Zet status op `processing`. (Hier gaan we in Stap 3 de AI triggeren).

---

## 3. Data Ops (De "Structuur")
Dit is de gedeelde code tussen je apps.

### **Wat is er veranderd?**
*   **`schema.ts`**:
    *   Kolom toegevoegd: `status` aan `guides` tabel (zodat we weten of een opname nog bezig is).
    *   Kolom toegevoegd: `metadata` aan `steps` tabel (voor extra info zoals tijdstip).
*   **`auth-schema.ts`**:
    *   **Geactiveerd**: Deze code stond uitgecommentarieerd, waardoor de build faalde. Ik heb dit aangezet zodat de database connectie werkt.

---

## Hoe het nu werkt (De Flow)
1.  Jij klikt **Start** in de Extensie.
2.  Extensie vraagt Data Service: "Maak een nieuwe guide". -> DB maakt rij.
3.  Jij klikt op een knop op een website.
4.  Extensie ziet de klik -> Maakt screenshot -> Stuurt naar Data Service.
5.  Data Service slaat screenshot op in R2 en maakt rij in `steps` tabel.
6.  Jij klikt **Stop**.
7.  Extensie zegt "Klaar". Data Service zet status op "Processing".

**Volgende Stap (Stap 3)**: Nu moeten we zorgen dat bij "Stop" ook echt de AI aan het werk gaat om titels te verzinnen bij die screenshots.
