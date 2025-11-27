Het is goed dat je dit vraagt. Als architect is het cruciaal om de juiste tool voor de juiste klus te kiezen. Hier is het onderscheid, specifiek voor jouw project (**Stepps.ai**):

### 1. Wanneer gebruik je wat? (In jouw project)

*   **Queues (De "Buffer"):**
    *   *Doel:* **Asynchrone verwerking & Betrouwbaarheid.**
    *   *Gebruik dit voor:* Het opslaan van de recording.
    *   *Waarom:* De gebruiker wil gewoon op "Stop" klikken en verder gaan. Hij wil niet wachten tot Postgres klaar is. De Queue pakt het aan, probeert het opnieuw als de DB even hikt, en handelt het af.
    *   *Metafoor:* De brievenbus. Je gooit de brief erin er loopt weg. De postbode (Queue) zorgt dat het aankomt.

*   **Workflows (De "Stappenplan Manager"):**
    *   *Doel:* **Lange, complexe processen met meerdere stappen.**
    *   *Gebruik dit voor:* Wat er gebeurt *nadat* de recording is opgeslagen.
    *   *Voorbeeld:*
        1.  Guide is opgeslagen in DB (trigger workflow).
        2.  Stap 1: Stuur tekst naar OpenAI voor een automatische samenvatting.
        3.  Stap 2: Wacht op antwoord.
        4.  Stap 3: Update de DB met de AI-tekst.
        5.  Stap 4: Stuur email naar gebruiker: "Je guide is klaar".
    *   *Metafoor:* Een receptenboek. Eerst snijden, dan bakken, dan serveren.

*   **Durable Objects (De "State Keeper"):**
    *   *Doel:* **Real-time samenwerking & Data consistentie.**
    *   *Gebruik dit voor:* Als twee mensen *tegelijk* in dezelfde Guide aan het editen zijn (zoals in Figma of Google Docs). Of voor je Analytics Counters (die `geo_link_clicks` code die je liet zien).
    *   *Waarom:* DO zorgt ervoor dat als Pietje een stap verwijdert, Jantje dat direct ziet. Postgres is hier te traag voor.
    *   *Metafoor:* Een vergaderruimte. Iedereen die binnen is, ziet en hoort hetzelfde op hetzelfde moment.