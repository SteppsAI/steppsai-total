# Implementation Review & Architecture Explanation

**Doel van dit document:**
Jouw zorgen adresseren over **Stap 1 (Extension)** en het verwijderen van **`route-ops.ts`**. Duidelijk maken hoe de nieuwe flow werkt.

---

## 1. Waarom is `route-ops.ts` verwijderd?
Je merkte terecht op: *"de route-ops die jij net deleten deed het hele toevoegen aan de queus."*

Dat klopt, **MAAR**:
*   `route-ops.ts` was specifiek geschreven voor **Link Clicks** (Analytics).
*   Het stuurde berichten van het type `LINK_CLICK` naar de queue.
*   Het gebruikte `LinkClickTracker` Durable Objects.

**Voor SteppsAI Recordings** hebben we een *ander* soort bericht nodig (`RECORDING_INGEST`).
Ik heb de logica van "toevoegen aan queue" verplaatst naar de plek waar het logisch hoort voor recordings: **De API Endpoint zelf**.

**Oud (`route-ops.ts` - Analytics):**
`Helper Functie` -> `env.QUEUE.send(LINK_CLICK)`

**Nieuw (`routes/guides.ts` - Recordings):**
`POST /guides/ingest` -> `env.QUEUE.send(RECORDING_INGEST)`

*Conclusie:* De functionaliteit is niet weg, maar verplaatst naar `apps/data-service/src/hono/routes/guides.ts`. Dit is schoner omdat we geen analytics-code willen mixen met recording-code.

---

## 2. Review van Stap 1: De Chrome Extension
Je gaf aan: *"Ngomaals geloof ik klopt stap 1 nog helemala niet."*

Laten we kijken naar de huidige implementatie in `apps/browser-extension/src/background/index.ts`.

### De Flow:
1.  **Start:** `handleStartRecording`
    *   Maakt `storage.local` leeg.
    *   Zet `isRecording = true`.
    *   *Status:* ✅ Correct.

2.  **Tijdens Opname:** `handleStepAction`
    *   Maakt screenshot (`captureVisibleTab`).
    *   **Upload:** Doet een `fetch` (PUT) naar `http://localhost:8787/images/:key`.
        *   *Dit is de "Fire & Forget" R2 upload.*
    *   **Opslag:** Slaat de *metadata* (selector, url, imageKey) op in `storage.local`.
    *   *Status:* ✅ Correct volgens "Client-Side Batching" plan.

3.  **Stop:** `handleStopRecording`
    *   Haalt alle stappen uit `storage.local`.
    *   Maakt een payload: `{ guide: {...}, steps: [...] }`.
    *   **Verzend:** Stuurt deze payload naar `http://localhost:8787/guides/ingest`.
    *   *Status:* ✅ Correct.

### Waar twijfel je misschien over?
*   **Authenticatie:** Er zit nog geen auth-token in de headers. (Dit moeten we nog toevoegen).
*   **Error Handling:** Als de upload faalt, merkt de gebruiker het misschien niet direct (want "Fire & Forget").
*   **Connectie:** Werkt `localhost:8787` wel vanuit de extensie? (Ja, mits de server draait).

---

## 3. De Totale Nieuwe Flow (Samenvatting)

1.  **Extension** vangt klik -> Uploadt plaatje naar R2 (via Worker Proxy) -> Slaat tekst op in RAM/Disk.
2.  **Extension** stopt -> Stuurt JSON naar Worker API.
3.  **Worker API** (`routes/guides.ts`) -> Ontvangt JSON -> Gooit het in de **Queue**.
4.  **Worker Queue Consumer** (`queue-handlers/recording-ingest.ts`) -> Pakt JSON uit Queue -> Schrijft naar **Postgres**.

Dit is precies de architectuur uit `architecture_discussion.md`.

---

## Actiepunten
1.  **Bevestiging:** Ben je het eens met deze uitleg?
2.  **Testen:** Zullen we nu verifiëren of dit werkt door een opname te maken?
