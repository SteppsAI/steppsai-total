# Beacon + Stepps.ai Integratie — Kan Dit Werken?

## TL;DR

**Ja, dit kan werken.** Beacon kan automatisch screen recordings laten maken die direct als Stepps.ai guides worden opgeslagen. Hieronder leg ik uit waarom, wat er al bestaat, wat je moet bouwen, en waar de grenzen liggen.

---

## Wat Beacon Is (kort)

Beacon is een iOS AI assistant die via OpenClaw 3000+ services aanstuurt. De user praat of typt, de AI agent voert uit. Stack: SwiftUI + Convex + Cloudflare Workers + OpenClaw containers per user.

## Wat Stepps.ai Al Heeft

De browser extension neemt nu handmatig workflows op:

| Wat het vastlegt | Data |
|---|---|
| **Elke klik** | CSS selector + x,y coordinaten (%) + page URL |
| **Navigatie** | Volledige URL per stap |
| **Screenshots** | WebP via offscreen document + canvas capture |
| **Metadata** | Step type (click/navigate/manual), volgorde |

De data-service verwerkt dit:
- Queue handler voegt automatisch captions toe ("Click on button", "Navigate to trello.com")
- Voegt click indicators (rode cirkels) toe op de juiste x,y positie
- Slaat screenshots op in R2
- Editor met Konva.js voor annotaties (cirkels, pijlen, tekst, blur)
- Export naar PDF/HTML/DOCX via Cloudflare Workflows

---

## De Integratie: Hoe Het Zou Werken

### Scenario

> Gebruiker op iPhone: *"Maak een SOP van hoe ik een Trello kaart aanmaak"*

### Flow

```
1. User spreekt in Beacon iOS app
   ↓
2. Beacon AI (OpenClaw) herkent: "dit is een Stepps.ai recording taak"
   ↓
3. OpenClaw skill roept Stepps.ai Worker API aan:
   POST /api/guides/execute { url: "https://trello.com", actions: [...] }
   ↓
4. Worker stuurt commando naar Chrome Extension (via bridge)
   ↓
5. Extension voert stappen uit IN de browser:
   - Navigeert naar trello.com
   - Klikt op "Add card"
   - Typt tekst
   - Maakt bij ELKE stap een screenshot (captureFrame)
   ↓
6. Extension roept bestaande recording.complete() aan
   ↓
7. Queue handler verwerkt: captions + click indicators + R2 upload
   ↓
8. Guide is klaar — zichtbaar in Stepps.ai dashboard
   ↓
9. Beacon stuurt bevestiging terug naar iOS: "SOP is klaar, 8 stappen opgenomen"
```

### Wat Al Bestaat vs. Wat Je Moet Bouwen

| Component | Status | Toelichting |
|---|---|---|
| Screenshot engine (`captureFrame()`) | BESTAAT | Offscreen document + canvas + WebP conversie |
| Element targeting (`domSelector`, `x,y`) | BESTAAT | Content script vangt dit al |
| Recording pipeline (tRPC → Queue → R2) | BESTAAT | `recording.start()` → `recording.complete()` → queue handler |
| Caption generator | BESTAAT | `generateStepDescription()` in data-service |
| Click overlay toevoegen | BESTAAT | Queue handler voegt rode cirkels toe op x,y |
| Editor + annotaties | BESTAAT | Konva.js canvas met circles, arrows, text, hide |
| Export (PDF/HTML/DOCX) | BESTAAT | Cloudflare Workflow met browser rendering |
| **Playback engine** | **MOET GEBOUWD** | Extension kan stappen uitvoeren (navigate + click) |
| **Bridge (Server → Extension)** | **MOET GEBOUWD** | Commando's van Worker naar extension sturen |
| **OpenClaw Skill** | **MOET GEBOUWD** | Beacon skill die Stepps.ai API aanroept |
| **Execute API endpoint** | **MOET GEBOUWD** | Worker endpoint om guides te triggeren |

---

## Technisch: Waarom Het Kan

### 1. De Extension heeft alle Chrome APIs

```
permissions: activeTab, scripting, sidePanel, storage, tabs, webNavigation, offscreen
host_permissions: <all_urls>
```

- `scripting` → kan code injecteren in elke tab (voor clicks)
- `tabs` → kan navigeren naar URLs
- `webNavigation` → kan wachten tot pagina geladen is
- `offscreen` → kan screenshots maken zonder user interactie (na initieel toestemming)

### 2. Screenshots werken al automatisch

De huidige flow bij een klik:

```
mousedown event → content script vangt selector + coords
                → background worker ontvangt STEP_ACTION
                → captureFrame() maakt screenshot via offscreen document
                → convertToWebP() comprimeert
                → images.upload() stuurt naar R2
```

Bij playback wordt dit exact hetzelfde, maar dan **vanuit code** in plaats van de user:

```
executeScript({ func: el.click() }) → wacht 500ms
                                    → captureFrame() maakt screenshot
                                    → convertToWebP()
                                    → images.upload()
```

De screenshot engine (`desktop-capture.ts`) werkt via een persistent MediaStream — zolang die actief is, kan `captureFrame()` onbeperkt frames pakken zonder opnieuw toestemming te vragen.

### 3. De recording pipeline is al queue-based

`completeRecording()` stuurt steps naar de `recording-ingest` queue. Die queue:
- Genereert captions (`generateStepDescription(domSelector)`)
- Voegt click indicators toe (rode cirkel overlay op x,y percentage)
- Slaat alles op in de database als JSONB

Dit werkt identiek voor handmatig opgenomen OF automatisch gegenereerde steps.

### 4. Beacon's OpenClaw kan externe APIs aanroepen

Elke user heeft een eigen container met ClawHub skills. Een custom Stepps.ai skill:

```
Skill: stepps-ai-recording
Triggers: "maak een SOP", "record workflow", "maak een guide"
Action: POST naar Stepps.ai Worker met URL + acties
```

---

## Technisch: Waar De Grenzen Liggen

### Chrome Moet Open Staan

De extension draait alleen in Chrome. Beacon op iOS kan niet direct Chrome op de desktop aansturen als die niet open staat.

**Oplossing:** Een "always-on" bridge tab op `stepps.ai/bridge` die:
- WebSocket open houdt naar de Worker
- Commando's ontvangt
- Via `chrome.runtime.sendMessage()` doorstuurt naar de extension
- `externally_connectable` staat dit al toe voor `https://*.stepps.ai/*`

### Screen Capture Toestemming

`getDisplayMedia()` vereist eenmalig user interactie. Daarna blijft de stream actief.

**Oplossing:** Bij eerste keer "Beacon recording starten" moet de user 1x toestemming geven. Daarna kan alles automatisch zolang Chrome open blijft.

### Dynamic Content / Selector Breaks

Websites veranderen hun DOM. Een selector als `div.css-1a2b3c > span` kan morgen anders zijn.

**Oplossing:** Fallback strategie:
1. Probeer `domSelector`
2. Als niet gevonden → gebruik `x,y` coordinaten
3. Als pagina er anders uitziet → maak screenshot + markeer als "needs review"

### Cross-Origin Beperkingen

Sommige sites blokkeren programmatic clicks (CAPTCHA, iframe sandboxing).

**Realiteit:** Dit is een fundamentele beperking. Werkt prima op interne tools, SaaS apps, admin panels. Werkt niet op sites met agressieve bot-detectie.

---

## De iOS Recording Vraag

> "Kan de iOS app automatisch screen recordings maken met screenshots?"

### Twee paden:

**Pad A: iOS stuurt Chrome aan (aanbevolen)**

De iOS app zelf maakt geen screenshots. Chrome doet het werk, de iOS app is de afstandsbediening.

```
iPhone → Beacon AI → "Record hoe ik X doe"
       → Cloudflare Worker → WebSocket → Chrome Extension
       → Extension doet alles (navigate, click, screenshot)
       → Guide klaar → push notification naar iPhone
```

Dit is het sterkste pad omdat je de hele bestaande Stepps.ai pipeline hergebruikt.

**Pad B: iOS maakt zelf screenshots (toekomst)**

iOS heeft `ReplayKit` voor screen recording. Maar:
- Vereist user permission per keer
- Geen DOM selectors (het is een video, geen structured data)
- Je zou AI vision nodig hebben om clicks te detecteren
- Veel complexer, minder betrouwbaar

**Advies:** Begin met Pad A. Dat hergebruikt 90% van wat je hebt.

---

## Bouwvolgorde

### Fase 1: Playback Engine (2-3 dagen)

Alleen in de browser extension, geen iOS nodig.

Nieuw bestand: `src/background/handlers/playback.ts`

```
handleExecuteGuide(guideId):
  1. Haal steps op via tRPC
  2. Open nieuw tabblad
  3. Start screen capture (startDesktopCapture)
  4. Voor elke stap:
     a. Navigate naar step.pageUrl (chrome.tabs.update)
     b. Wacht op webNavigation.onCompleted
     c. Inject content script
     d. Voer click uit (executeScript met querySelector of elementFromPoint)
     e. Wacht 500-1000ms
     f. captureFrame() → screenshot
     g. Upload naar R2
  5. Roep recording.complete() aan
  6. Stop capture
```

Test dit door handmatig in de side panel een "Replay" knop toe te voegen.

### Fase 2: Execute API Endpoint (1 dag)

Nieuw in data-service:

```
POST /api/guides/:guideId/execute
Body: { targetUrl?: string, overrides?: Step[] }
Response: { executionId, status: 'queued' }
```

Durable Object `GuideExecution` houdt status bij:
- queued → running → completed/failed
- Slaat resultaat-guideId op

### Fase 3: Bridge Tab (1-2 dagen)

Nieuwe route in user-application: `/app/bridge`

```
- Maakt WebSocket verbinding naar Worker
- Luistert op commando's
- Stuurt door naar extension via chrome.runtime.sendMessage()
- Toont status: "Connected", "Executing guide X..."
```

### Fase 4: OpenClaw Skill (1 dag)

Custom ClawHub skill:

```
Name: stepps-ai
Triggers: "record", "maak SOP", "create guide"
Action: POST /api/guides/execute
Parameters: url (string), description (string)
```

---

## Conclusie

| Vraag | Antwoord |
|---|---|
| Kan Beacon Stepps.ai guides automatisch laten opnemen? | **Ja** |
| Inclusief screenshots? | **Ja** — `captureFrame()` en de hele R2 pipeline bestaan al |
| Inclusief click indicators? | **Ja** — queue handler doet dit al automatisch |
| Inclusief captions? | **Ja** — `generateStepDescription()` bestaat al |
| Kan de user daarna editen? | **Ja** — editor met annotaties, drag-reorder, inline captions |
| Kan het exporteren naar PDF? | **Ja** — workflow met browser rendering bestaat al |
| Moet Chrome open staan? | **Ja** — dat is de enige echte beperking |
| Hoeveel moet je bouwen? | **~5-7 dagen** voor de volledige flow |
| Hoeveel hergebruik je? | **~80%** van de bestaande codebase |

De "painkiller" is dat je vanuit je telefoon zegt *"Maak een SOP van X"* en 30 seconden later heb je een volledige guide met screenshots, click indicators, en captions — klaar om te editen of te delen. Dat bestaat nergens anders.

---

## iOS → Chrome Openen (Native)

### Het Probleem

De extension draait in Chrome op desktop/laptop. De user zit op een iPhone. Hoe open je Chrome vanuit de Beacon iOS app?

### De Oplossing: URL Schemes

Chrome op iOS registreert custom URL schemes. Je kunt Chrome openen EN direct naar een specifieke URL navigeren.

| Scheme | Wat het doet |
|---|---|
| `googlechrome://` | Opent Chrome met een `http://` URL |
| `googlechromes://` | Opent Chrome met een `https://` URL |
| `googlechrome-x-callback://` | Opent Chrome met callback (kan terugkeren naar jouw app) |

### SwiftUI Implementatie

```swift
// BeaconBridgeService.swift

import SwiftUI

class BeaconBridgeService {

    static let bridgeURL = "https://stepps.ai/app/bridge"

    /// Check of Chrome geinstalleerd is
    static var isChromeInstalled: Bool {
        guard let url = URL(string: "googlechromes://") else { return false }
        return UIApplication.shared.canOpenURL(url)
    }

    /// Open de Stepps.ai bridge tab in Chrome
    static func openBridgeInChrome() {
        // https:// → googlechromes://
        let chromeURL = bridgeURL.replacingOccurrences(
            of: "https://",
            with: "googlechromes://"
        )

        if let url = URL(string: chromeURL), isChromeInstalled {
            UIApplication.shared.open(url)
        } else if let url = URL(string: bridgeURL) {
            // Fallback: open in Safari
            UIApplication.shared.open(url)
        }
    }

    /// Open Chrome met x-callback (keert terug naar Beacon na laden)
    static func openBridgeWithCallback() {
        let callback = "googlechrome-x-callback://x-callback-url/open/"
            + "?url=\(bridgeURL.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? bridgeURL)"
            + "&x-source=Beacon"
            + "&x-success=beacon://"  // Beacon's eigen URL scheme om terug te keren

        if let url = URL(string: callback) {
            UIApplication.shared.open(url)
        }
    }
}
```

### Info.plist Configuratie

```xml
<!-- Toevoegen aan Info.plist -->

<!-- Nodig om canOpenURL te gebruiken voor Chrome -->
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>googlechrome</string>
    <string>googlechromes</string>
    <string>googlechrome-x-callback</string>
</array>

<!-- Beacon's eigen URL scheme (voor x-callback terugkeer) -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>beacon</string>
        </array>
    </dict>
</array>
```

### UX Flow In De App

```swift
// In de Beacon chat view — wanneer AI een recording wil starten

struct RecordingSetupView: View {
    @State private var chromeReady = false

    var body: some View {
        VStack(spacing: 16) {
            if BeaconBridgeService.isChromeInstalled {
                if !chromeReady {
                    // Stap 1: Chrome openen met bridge
                    VStack(spacing: 12) {
                        Image(systemName: "desktopcomputer")
                            .font(.system(size: 40))
                            .foregroundColor(Color(hex: "#b9454d"))

                        Text("Chrome openen")
                            .font(.headline)

                        Text("Beacon opent Chrome met de recording bridge. Dit hoef je maar 1x te doen.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)

                        Button("Open Chrome") {
                            BeaconBridgeService.openBridgeInChrome()
                            // Na 3 sec aannemen dat Chrome open is
                            DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                                chromeReady = true
                            }
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color(hex: "#b9454d"))
                    }
                } else {
                    // Stap 2: Klaar om te recorden
                    VStack(spacing: 12) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 40))
                            .foregroundColor(.green)

                        Text("Chrome is verbonden")
                            .font(.headline)

                        Text("Je kunt nu recordings starten vanuit Beacon.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
            } else {
                // Chrome niet geinstalleerd
                VStack(spacing: 12) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.system(size: 40))
                        .foregroundColor(.orange)

                    Text("Chrome is nodig")
                        .font(.headline)

                    Text("Installeer Google Chrome om automatische recordings te maken.")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)

                    Link("Download Chrome",
                         destination: URL(string: "https://apps.apple.com/app/google-chrome/id535886823")!)
                        .buttonStyle(.borderedProminent)
                        .tint(Color(hex: "#b9454d"))
                }
            }
        }
        .padding(24)
    }
}
```

### Wat De User Ziet

```
EERSTE KEER:
┌─────────────────────────────────┐
│                                 │
│     🖥️  Chrome openen           │
│                                 │
│  Beacon opent Chrome met de     │
│  recording bridge. Dit hoef je  │
│  maar 1x te doen.              │
│                                 │
│     [ Open Chrome ]             │
│                                 │
└─────────────────────────────────┘
         ↓ tikt op knop
   Chrome opent automatisch
   op stepps.ai/app/bridge
         ↓
┌─────────────────────────────────┐
│                                 │
│     ✅  Chrome is verbonden     │
│                                 │
│  Je kunt nu recordings starten  │
│  vanuit Beacon.                 │
│                                 │
└─────────────────────────────────┘

DAARNA (elke volgende keer):
User: "Maak een SOP van Trello"
Beacon: "Ik neem het op... 🔴"
  → Chrome doet alles op de achtergrond
Beacon: "Klaar! 6 stappen. [Bekijk in Stepps.ai →]"
```

### Desktop vs. Mobiel Chrome

**Belangrijk:** `googlechromes://` opent Chrome op **het iOS device zelf**. Maar de Stepps.ai extension draait op **desktop Chrome**.

Twee opties:

**Optie A: User heeft Chrome op desktop open (simpelst)**
- De bridge tab (`stepps.ai/app/bridge`) draait op desktop Chrome
- iOS Beacon communiceert via de Cloudflare Worker (niet direct met Chrome)
- iOS hoeft Chrome niet te openen — alleen de Worker API aanroepen

```
iPhone Beacon → Cloudflare Worker → Desktop Chrome bridge tab → Extension
```

**Optie B: User gebruikt Chrome op iOS (toekomst)**
- iOS Chrome heeft geen extension support
- Maar de bridge tab KAN wel draaien in iOS Chrome
- Bridge tab op iOS pollt Worker voor commando's
- Stuurt die door naar desktop Chrome via Worker als relay

**Aanbeveling:** Optie A. De iOS app hoeft alleen de Worker API aan te roepen. Chrome op desktop moet open staan met de bridge tab. De iOS "Open Chrome" knop is een fallback/instructie.

### De Simpelste Versie

```swift
// In Beacon's ChatService — wanneer user een recording wil

func requestRecording(description: String, targetUrl: String) async throws {
    // Roep gewoon de Stepps.ai Worker API aan
    // Chrome op desktop pikt het op via de bridge tab
    let response = try await apiClient.post(
        "\(steppsApiUrl)/api/guides/execute",
        body: [
            "description": description,
            "targetUrl": targetUrl
        ],
        headers: ["Authorization": "Bearer \(userToken)"]
    )

    // Worker stuurt het door naar desktop Chrome
    // Extension maakt de recording
    // Push notification als het klaar is
}
```

De iOS app hoeft Chrome niet eens te openen. Het enige wat nodig is:
1. Desktop Chrome staat open met bridge tab (eenmalige setup)
2. iOS app roept de Worker API aan
3. Worker stuurt commando door naar bridge → extension
4. Klaar → push notification naar iPhone
