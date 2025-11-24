# Huidige Status & Actieplan

**Doel:** Een schone, efficiënte implementatie van de Recording Flow (Client-Side Batching + Queues).

**Wat ik nu aan het doen ben:**
1.  **Cleanup:** Ik verwijder alle oude referentie-code (zoals `link_click`, `geo_link_clicks`, `durable-objects` die niet voor SteppsAI zijn) uit `apps/data-service` en `packages/data-ops`. We willen alleen code die we *echt* gebruiken.
2.  **Zod Schema's:** Ik pas `packages/data-ops/src/zod/queue.ts` aan zodat deze alleen de `RECORDING_INGEST` definitie bevat.
3.  **Data Service:** Ik schoon `app.ts` op zodat alleen de `/guides` en `/images` routes overblijven.

**Reeds gedaan (Step 1 - Extension):**
*   De `background/index.ts` is herschreven voor Client-Side Batching.
    *   Slaat stappen op in `storage.local`.
    *   Uploadt screenshots direct naar R2 (`PUT /images/:key`).
    *   Stuurt bij stop alles naar `/guides/ingest`.

**Volgende Stappen:**
1.  Rond de cleanup af.
2.  Verifieer dat de extensie correct communiceert met de opgeschoonde API.
3.  Implementeer de Queue Consumer (de worker die de DB vult).
