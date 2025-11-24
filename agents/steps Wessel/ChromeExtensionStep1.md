*Focus: Capture logic & permissions.*

- **Config: manifest.json & Permissions**
    - **Action:** Define permissions in manifest.json.
    - **Required Permissions:**
        - activeTab (To capture the current tab).
        - scripting (To inject the click listener).
        - storage (To save sessionId locally so state persists across navigations).
    - **Host Permissions:**<all_urls> (or specific match patterns) to ensure captureVisibleTab works everywhere.
    - **Background:** Define service_worker.
- **Logic: Background Script (background.ts)**
    - **Action:** Handle the "screenshot" command.
    - **Code Logic:**
        - Listen for message CAPTURE_STEP from Content Script.
        - Call chrome.tabs.captureVisibleTab(null, {format: 'jpeg', quality: 80}).
        - **Crucial:** Do *not* upload from here if possible (to keep extension light). Pass the base64 to the Content Script or send directly to Hono via fetch.
        - *Recommendation:* Send directly to Hono POST /api/v1/steps using fetch.
- **Logic: Content Script (Click Listener)**
    - **Action:** Detect *what* the user did.
    - **Code Logic:**
        - document.addEventListener('click', handler, true) (Capture phase).
        - On click:
            1. event.preventDefault() (temporarily pause nav).
            2. Generate CSS Selector (unique path to element).
            3. Send message to Background: "Take screenshot".
            4. Wait for Background confirmation.
            5. Re-trigger the click or unblock navigation.